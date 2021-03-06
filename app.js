const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const index = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

app.use("/", index);
//catch 400 error
app.use(function(err, req, res, next) {
	res.status(err.status || 400);
	res.send({ "status": "Invalid Json" });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = { "status": "Bad URI path" };
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
	res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render({ "status": "Backend Error" });
});

module.exports = app;
