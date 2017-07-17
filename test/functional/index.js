
"use strict";
const should = require("should");
const assert = require("chai").assert;
const request = require("request-promise");

describe("Functional Testing emailAPI", function() {
	this.timeout(15000);
	beforeEach((done) => {
		require("../../bin/www");
		done();
	});

	it("Test Express Server", (done) => {
		request("http://localhost:3000/")
		.then(function(data) {
			should.exist(data);
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should fail due to mailgun invalid email", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["abc@gmail.com", "cde@gmail.com"],
				cc: ["dsa@gmail.com", "dsw@gmail.com"],
				bcc: ["yyy@gmail.com", "blah@gmail.com"],
				subject: "Func Test",
				text: "Running Func test"
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Validation Error", "Validation Error");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should send via mailgun because of mailgun validates legitimate email", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["james.z.kwok@gmail.com"],
				subject: "Func Test",
				text: "Running Func test"
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Sent Email via Mailgun", "Sent Email via Mailgun");

			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should send via sendgrid", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["james.z.kwok@gmail.com"],
				subject: "Func Test",
				text: "Running Func test",
				failover: true
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Sent Email via Sendgrid", "Sent Email via Sendgrid");

			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should send via sendgrid with multiple to email", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["james.z.kwok@gmail.com", "james.z.kwok2@gmail.com"],
				subject: "Func Test",
				text: "Running Func test",
				failover: true
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Sent Email via Sendgrid", "Sent Email via Sendgrid");

			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should return error for missing email destination", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				subject: "Func Test",
				text: "Running Func test"
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Validation Error", "Validation Error");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should return error for missing text", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["james.z.kwok@gmail.com"],
				subject: "Func Test"
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Validation Error", "Validation Error");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should return error for missing subject", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {
				to: ["james.z.kwok@gmail.com"],
				text: "Running Func test"
			},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			should.exist(data);
			assert(data.status === "Validation Error", "Validation Error");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});

	it("should return validation error for missing body", (done) => {
		const options = {
			method: "POST",
			uri: "http://localhost:3000/api",
			body: {},
			json: true // Automatically stringifies the body to JSON
		};
		request(options)
		.then(function(data) {
			console.log(data);
			should.exist(data);
			assert(data.status === "Validation Error", "Validation Error");
			done();
		})
		.catch(function(err) {
			should.not.exist(err);
			done();
		});
	});
});
