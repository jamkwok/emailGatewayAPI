# email API Challenge

## Overview
Runs a basic REST API that sends email via Mailgun and Sendgrid, if Mailgun were to fail then the api will automatically default to Sendgrid, however this can be simulated in the api by using the **failover: true** flag.

*  Uses Mailgun email validator to validate emails recipients are genuine.
*  If Mailgun validator is down then it will check with simple regex.
*  If regex is successful then attempt to send email via Mailgun.
*  If email cannot be sent via Mailgun then it will try send via Sendgrid.
*  If both Mailgun and Sendgrid fail then it will reply that the email could not be sent.

## Email Provider Caveat
* Mailgun: Requires all email recipients be authorized by adding in the Mailgun account (For the Free Account) and for each to click the activate in the subscription email.
* Sendgrid: No Limitations.

## Assumptions
* Create a service backend that accepts the necessary information and sends emails via Mailgun and Sendgrid.
* Your solution should cater for multiple email recipients, CCs and BCCs but there is no need to support HTML email body types (plain text is OK)
* The backend should be implemented as one or more RESTful API calls (see technology constraints below).
* No authentication is required for the scope of this exercise
* No client library should be used to integrate with Mailgun or Sendgrid. A simple HTTP client of choice can be used to handcraft HTTP requests to the email gateway services.

## Api Deployment
* Install docker and docker-compose
* Requires internet connectivity to access Mailgun and Sendgrid (Requires a NAT gateway if the host is located in a private subnet)
* Update env.json with Mailgun API key to send emails, Mailgun domain and validation key for email validation.
* Update env.json with Sendgrid api key to send emails.
* Run docker-compose up to start the docker image build and deploy.
```shell
docker-compose up
```

## Environment
Mailgun and Sendgrid credentials are stored in the env.json. On launching the application this is JS required into the routes/index.js of the application. Each environment is a property of the main JSON block, so therefore must exist. Based on the environment variable NODE_ENV, the application will select the appropriate set of credentials, if no NODE_ENV exists then it will default to dev. For production use, this env.json can be encrypted to protect the credentials within.
```shell
export NODE_ENV=dev
```
## Front end User Guide
* Emails are comma delimited with no spaces.
* validator allows send email option after required fields are sent.

## Technology Stack
* Angular 4
* NodeJS 6 with express 4.0 framework using modules request-promise as the transport for crafted requests.
* Docker
* Node Class in lib/index.js
* Failover logic handled in routes/index.js is simulated by altering the Mailgun domain to blah.Mailgun.net (an unreachable sub domain) from api.Mailgun.net

## Architecture
* Application port is on 3000 via express framework.
* Docker compose port forwards 80 to 3000 (make sure port 80 is not taken up already on the host computer)

## Test cases
Functional and unit tests found in test.
```shell
#Install Mocha
npm install mocha -G
# mocha unit tests (test methods directly)
mocha test/unit
# mocha functional tests (test api via express server )
mocha test/functional
# All tests
mocha test
```


## Examples
### Required fields
* to: array
* subject: string
* text: string

### Example1 (Use Mailgun to send email)
* endpoint: http://127.0.0.1/api
* method: POST
```json
{
	"to": ["person1@gmail.com"],
	"subject": "Func Test",
	"text": "Running Func test",
	"failover": false,
	"debug": true
}
```

### Example2 (Use Sendgrid to send email by simulating failover)
* endpoint: http://127.0.0.1/api
* method: POST
```json
{
	"to": ["person1@gmail.com"],
	"subject": "Func Test",
	"text": "Running Func test",
	"failover": true,
	"debug": true
}
```

### Example3 (Use Mailgun to send email to multiple recipients)
* endpoint: http://127.0.0.1/api
* method: POST
```json
{
	"to": ["person1@gmail.com", "person2@gmail.com"],
	"cc": ["person3@gmail.com", "person4@gmail.com"],
	"bcc": ["person5@gmail.com", "person6@gmail.com"],
	"subject": "Func Test",
	"text": "Running Func test",
	"failover": false,
	"debug": true
}
```
## Future Improvements
* Implement a queueing system so emails are queued within the system.
* Add API to allow for email Authorization for Mailgun.
