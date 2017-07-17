const express = require("express");
const router = express.Router();
const clone  = require("clone");
const root = require("../index");
const config = require("../env.json");
const environment = process.env.NODE_ENV || "dev";
const EmailAPI = root.emailAPI;
const optionsAPI = config[environment];

/* GET home page. */
router.get("/", (req, res) => {
	res.send({ status: "OK" });
});

router.post("/api", (req, res) => {
	const options = clone(optionsAPI);
	//turn on debug mode
	if (req.body.debug) options.debug = true;
	//initialise header lock
	options.headerLock = false;
	//simulate failover
	if (req.body.failover) options.mailgun.endpoint = "blah.mailgun.net";
	const emailAPI = new EmailAPI(options);
	 //Methods require to, cc and bcc to be of type array.
	if (!req.body.to) req.body.to = [];
	if (!req.body.cc) req.body.cc = [];
	if (!req.body.bcc) req.body.bcc = [];

	emailAPI.mailgunSendEmail(req.body)
		.then((data) => {
			if (req.body.debug) console.log("Sent via mailgun");
			if (!options.headerLock) res.send({ "status": "Sent Email via Mailgun" });
			//Set Lock so no res.send cannot re-initiate
			options.headerLock = true;
		})
		.catch((err) => {
			if (req.body.debug) console.log(err);
			//Try Sendgrid if error is not a validation error
			if(err !== false) {
				if (req.body.debug) console.log("try send via sendgrid");
				return emailAPI.sendgridSendEmail(req.body);
			}
			if (!options.headerLock) res.send({ "status": "Validation Error" });
			options.headerLock = true;
		})
		.then((data) => {
			if (req.body.debug) console.log("Sent via sendgrid");
			if (req.body.debug)
			if (!options.headerLock) res.send({ "status": "Sent Email via Sendgrid" });
			options.headerLock = true;
		})
		.catch((err) => {
			console.log(err);
			if (req.body.debug) console.log("Failed to Send Email");
			if (!options.headerLock) res.send({ "status": "Failed to Send Email" });
			options.headerLock = true;
		});
});


module.exports = router;
