
"use strict";
// get main class first
const emailAPI = require("./lib");

emailAPI.path = require("path");

emailAPI.version = require("./package.json").version;

module.exports = emailAPI;
