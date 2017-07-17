"use strict";
const request_promise = require("request-promise");

class emailAPI {
	constructor(options) {
		this.options = options || {};
		return this;
	}

	isValidParams(params) {
		const self = this;
		return new Promise((success, fail) => {
			if(!params) {
				return fail(false);
			}
			if((!params.to) || (!params.cc) || (!params.bcc)) {
				//Error: Missing email destination
				return fail(false);
			}
			if((!Array.isArray(params.to)) || (!Array.isArray(params.cc)) || (!Array.isArray(params.bcc))) {
				//Error: json destiantion fields must be of type array.
				return fail(false);
			}
			//Needs atleast the to field
			if(params.to.length < 1){
				return fail(false);
			}
			return success(true);
		});

	}

	checkEmailSyntax(email) {
		const self = this;
		//Regex to validate email address
		const emailRegex =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return new Promise((success, fail) => {
    	if(emailRegex.test(email)) {
				return success(true);
			}
			return fail(false);
		});
	}

	getAuth(gateway, emailVal) {
		const self = this;
		return new Promise((success, fail) => {
			if ((!gateway) || (typeof emailVal !== "boolean")) {
				return fail("Error: No Gateway string or emailVal Boolean Specified");
			}
			if (gateway === "mailgun") {
				if (emailVal) {
					return success("Basic " + new Buffer(self.options[gateway].user + ":" + self.options[gateway].emailValidationKey).toString("base64"));
				}
				return success("Basic " + new Buffer(self.options[gateway].user + ":" + self.options[gateway].apiKey).toString("base64"));
			} else if (gateway === "sendgrid") {
				return success("Bearer " + self.options[gateway].apiKey);
			} else {
				return fail("Error: No Gateway matched");
			}
		});
	}

	mailgunEmailValidation(email) {
		const self = this;
		let requestOptions = {
			timeout: self.options.mailgun.timeout,
			headers: {},
			uri: "https://" + self.options.mailgun.endpoint + "/address/validate",
			form: {
				address: email
			}
		};
		return self.getAuth("mailgun", true)
		.then((basicAuth) => {
			requestOptions.headers.Authorization = basicAuth;
			//Make Http Request
			return request_promise(requestOptions);
		})
		.then((data) => {
			if (self.options.debug) console.log("Validated by Mailgun");
			return JSON.parse(data).is_valid;
		})
		.catch((err) => {
			if (self.options.debug) console.log("Validated by method checkEmailSyntax");
			//if mailgun endpoint is unreachable just check email regex
			return self.checkEmailSyntax(email);
		});
	}

	validateToCcBccEmails(params) {
		const self = this;
		return self.isValidParams(params)
		.then(() => {
			//Create an array of Promises of destination
			const destinations = params.to.concat(params.cc.concat(params.bcc)).map((email) => {
				return self.mailgunEmailValidation(email);
			});
			return Promise.all(destinations)
			.then((emailValidity) => {
				//Check all destination emails are valid by comparing emails to true responses.
				if (emailValidity.length === emailValidity.filter((isEmailValid) => {
				  return isEmailValid === true;
				}).length) {
					return true;
				}
				return false;
			});
		})
		.catch((err) => {
			return err;
		});
	}

	validateSubjectAndText(params) {
		//Check subject and Text exist
		if((!params.subject) || (!params.text)) {
			return false;
		}
		return true;
	}

	mailgunSendEmail(params) {
		const self = this;
		let requestOptions;
		if (self.options.debug) console.log("mailgunSendEmail");
		if (self.options.debug) console.log(params);
		//Create Mailgun Request
		//Check params are legitimate
		return self.validateToCcBccEmails(params)
		.then((emailValidity) => {
			return new Promise((success, fail) => {
				if(!emailValidity) {
					if (self.options.debug) console.log("Error: Destination emails do not appear to be valid");
					return fail(false);
				}
				if(!self.validateSubjectAndText(params)) {
					if (self.options.debug) console.log("Error: Missing Text or Subject Parameter");
					return fail(false);
				}
				return success(true);
			});
		})
		.then(() => {
			if (self.options.debug) console.log("Construct http Request");
			//Construct http Request
			requestOptions = {
				method: "POST",
				headers: {},
				uri: "https://" + self.options.mailgun.endpoint + "/" + self.options.mailgun.domain + "/messages",
				form: {
					from:  self.options.mailgun.source,
					to: params.to.toString(),
					subject: params.subject,
					text: params.text
				}
			};
			//Add cc
			if(params.cc.length > 0) {
				requestOptions.form.cc = params.cc.toString();
			}
			//Add bcc
			if(params.bcc.length > 0) {
				requestOptions.form.bcc = params.bcc.toString();
			}
			return self.getAuth("mailgun", false);
		})
		.then((basicAuth) => {
			requestOptions.headers.Authorization = basicAuth;
			//Make Http Request
			return request_promise(requestOptions);
		})
		.then((data) => {
			return JSON.parse(data);
		});
	}

	sendgridSendEmail(params) {
		const self = this;
		let requestOptions;
		if (self.options.debug) console.log("sendgridSendEmail");
		if (self.options.debug) console.log(params);
		//Create sendgrid Request
		if (self.options.debug) console.log("Construct http Request");
		//Construct http Request
		requestOptions = {
			method: "POST",
			headers: {},
			uri: "https://" + self.options.sendgrid.endpoint + "/mail/send",
			json: true
		};

		requestOptions.headers["Content-Type"] = "application/json";
		requestOptions.body = {
			personalizations: [],
			from: {
				email: self.options.sendgrid.source
			},
			subject: params.subject,
			content: [{
				type: "text/plain",
				value: params.text
			}]
		};

    //create email destination arrays
		const toArray = params.to.map((emailAddress) => { return { email: emailAddress };});
		const ccArray = params.cc.map((emailAddress) => { return { email: emailAddress };});
		const bccArray = params.bcc.map((emailAddress) => { return { email: emailAddress };});
		//construct personalization properties
		if((params.cc.length < 1) && (params.bcc.length < 1)) {
			requestOptions.body.personalizations.push({
				to: toArray
			});
		} else if((params.cc.length > 0) && (params.bcc.length < 1)) {
			requestOptions.body.personalizations.push({
				to: toArray,
				cc: ccArray
			});
		} else if((params.cc.length < 1) && (params.bcc.length > 0)) {
			requestOptions.body.personalizations.push({
				to: toArray,
				bcc: bccArray
			});
		} else if((params.cc.length > 0) && (params.bcc.length > 0)) {
			requestOptions.body.personalizations.push({
				to: toArray,
				cc: ccArray,
				bcc: bccArray
			});
		}

		return self.getAuth("sendgrid", false)
		.then((auth) => {
			requestOptions.headers.Authorization = auth;
			//Make Http Request
			return request_promise(requestOptions);
		})
		.then(() => {
			return true;
		});
	}
}

module.exports = {
	emailAPI: emailAPI
};
