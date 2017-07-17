
"use strict";
const root = require("../../index");
const EmailAPI = root.emailAPI;
const should = require("should");
const assert = require("chai").assert;
const clone = require("clone");
const config = require('../../env.json');
const environment = process.env.NODE_ENV || 'dev';

let optionsAPI;

describe("Unit Testing emailAPI", function() {
	this.timeout(15000);
	beforeEach((done) => {
		optionsAPI = config[environment];
		optionsAPI.debug = true;
		done();
	});

	it("Should validate email jameskwok@blah.com", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.checkEmailSyntax("jameskwok@blah.com")
		.then(function(data) {
			should.exist(data);
			assert(data === true, "SHould be valid");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should validate email blah@blah.com.au", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.checkEmailSyntax("blah@blah.com.au")
		.then(function(data) {
			should.exist(data);
			assert(data === true, "should be valid");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should invalidate email blah.blah.com", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.checkEmailSyntax("blah.blah.com")
		.then(function(data) {
			should.not.exist(data);
			done();
		})
		.catch(function(err) {
			should.exist(err);
			assert(err === false, "Should be invalid");
			done();
		});
	});

	it("Should invalidate email blah@blah..", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.checkEmailSyntax("blah@blah..")
		.then(function(data) {
			should.not.exist(data);
			done();
		})
		.catch(function(err) {
			should.exist(err);
			assert(err === false, "Should be invalid");
			done();
		});
	});

	it("Should return basic auth header mailgun with emailVal=true", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.getAuth('mailgun', true)
		.then(function(data) {
			console.log(data);
			should.exist(data);
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should return basic auth header mailgun with emailVal=false", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.getAuth('mailgun', false)
		.then(function(data) {
			console.log(data);
			should.exist(data);
			assert(data.indexOf('Basic') !== -1, 'Contains Basic Auth header');
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should return sendgrid auth header with emailVal=false", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.getAuth('sendgrid', false)
		.then(function(data) {
			should.exist(data);
			console.log(data);
			assert(data.indexOf('Bearer') !== -1, 'Contains Bearer token');
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should validate email via mailgun", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.mailgunEmailValidation('james.z.kwok@gmail.com')
		.then(function(data) {
			should.exist(data);
			assert(data === true, 'is a valid email');
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("Should validate email via emailSyntax Checker if mailgun is down", (done) => {
		let options  = clone(optionsAPI);
		options.mailgun.endpoint = 'blah.mailgun.net/v2'
		const emailAPI = new EmailAPI(options);
		emailAPI.mailgunEmailValidation('blah@devopsglue.com')
		.then(function(data) {
			should.exist(data);
			assert(data === true, 'valid email syntax');
			done();
		})
		.catch(function(err) {
			console.log(err);
			should.not.exist(err);
			done();
		});
	});

	it("Should invalidate if mailgun is up", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.mailgunEmailValidation('blah@asdasdsadasdasd.com')
		.then(function(data) {
			should.exist(data);
			assert(data === false, 'is not a valid email according to mailgun');
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("send Email via Mailgun", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.mailgunSendEmail({
			to: ['james.z.kwok@gmail.com', 'james.z.kwok@gmail.com'],
			cc: ['james.z.kwok@gmail.com'],
			bcc: [],
			subject: 'Some Subject mailgun',
			text: 'Some Message mailgun'
		})
		.then(function(data) {
			should.exist(data);
			assert(data.message === 'Queued. Thank you.', 'mailgun message queued');
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("send Email via sendgrid", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.sendgridSendEmail({
			to: ['james.z.kwok@gmail.com', 'asdasd@gmail.com'],
			cc: ['james.z.kwok2@gmail.com'],
			bcc: ['james.z.kwok3@gmail.com'],
			subject: 'Some Subject Sendgrid',
			text: 'Some Message Sendgrid'
		})
		.then(function(data) {
			//Send grid returns headers if no error is detected to indicate what has happened
			should.exist(data);
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("send Email via sendgrid but with to and bcc", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		emailAPI.sendgridSendEmail({
			to: ['james.z.kwok@gmail.com'],
			cc: [],
			bcc: ['james.z.kwok3@gmail.com'],
			subject: 'Some Subject Sendgrid',
			text: 'Some Message Sendgrid'
		})
		.then(function(data) {
			//Send grid returns headers if no error is detected to indicate what has happened
			should.exist(data);
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});


	it("general email json validator for destination emails", (done) => {
		let options  = clone(optionsAPI);
		options.mailgun.endpoint = 'blah.mailgun.net/v2'
		const emailAPI = new EmailAPI(options);
		const params = {
			to: ['abc@gmail.com', 'cde@gmail.com'],
			cc: ['dsa@gmail.com', 'dsw@gmail.com'],
			bcc: ['yyy@gmail.com', 'blah@gmail.com'],
			subject: 'Some Subject',
			text: 'Some Message'
		};
		emailAPI.validateToCcBccEmails(params)
		.then(function(data) {
			should.exist(data);
			assert(data === true, 'should return valid email syntax status');
			done();
		})
		.catch(function(err) {
			console.log(err);
			should.not.exist(err);
			done();
		});
	});

	it("Should validate if text and subject exist", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		const params = {
			to: ['abc@gmail.com', 'cde@gmail.com'],
			cc: ['dsa@gmail.com', 'dsw@gmail.com'],
			bcc: ['yyy@gmail.com', 'blah@gmail.com'],
			subject: 'Some Subject',
			text: 'Some Message'
		};
		const status = emailAPI.validateSubjectAndText(params);
		assert(status === true, 'return subject and text validity');
		done();
	});

	it("Should invalidate if text and subject does not exist", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		const params = {
			to: ['abc@gmail.com', 'cde@gmail.com'],
			cc: ['dsa@gmail.com', 'dsw@gmail.com'],
			bcc: ['yyy@gmail.com', 'blah@gmail.com']
		};
		const status = emailAPI.validateSubjectAndText(params);
		assert(status === false, 'return subject and text invalidity');
		done();
	});

	it("Should invalidate if text does not exist", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		const params = {
			to: ['abc@gmail.com', 'cde@gmail.com'],
			cc: ['dsa@gmail.com', 'dsw@gmail.com'],
			bcc: ['yyy@gmail.com', 'blah@gmail.com'],
			subject: 'asdasdasd'
		};
		const status = emailAPI.validateSubjectAndText(params);
		assert(status === false, 'return subject and text invalidity');
		done();
	});

	it("Should invalidate if subject does not exist", (done) => {
		let options  = clone(optionsAPI);
		const emailAPI = new EmailAPI(options);
		const params = {
			to: ['abc@gmail.com', 'cde@gmail.com'],
			cc: ['dsa@gmail.com', 'dsw@gmail.com'],
			bcc: ['yyy@gmail.com', 'blah@gmail.com'],
			text: 'asdasdasd'
		};
		const status = emailAPI.validateSubjectAndText(params);
		assert(status === false, 'return subject and text invalidity');
		done();
	});

});
