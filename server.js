/* Define some initial variables. */
var applicationRoot = __dirname.replace(/\\/g,"/"),
  mockRoot = applicationRoot + '/test/mocks/api',
  mockRootPattern = mockRoot + '/**/*',
  apiRoot = '',
  debug = false,

  http = require('http'),

  fs = require("fs"),
  glob = require("glob"),
  path = require('path');

/* Create Express application */
var express = require("express");
var app = express();
var xmlparser = require('express-xml-bodyparser');
var cookieParser = require('cookie-parser');
app.use(xmlparser());
app.use(cookieParser());

/* Configure a simple logger and an error handler. */
app.all('env', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/*
 * Functions to help us debug the requests.
 */
function stringifyRequest(request) {
   var requestInfo = 'Path: ' + request.originalUrl
      + '\n' + 'Method: ' + request.method
      + '\n' + 'Headers: ' + JSON.stringify(request.headers)
      + '\n' + 'Body: ' + JSON.stringify(request.body);
   return requestInfo;
}

function dumpRequest(request) {
  console.log('\n' + stringifyRequest(request) + '\n');
}

/* Read the directory tree according to the pattern specified above. */
var files = glob.sync(mockRootPattern);

/* Register mappings for each file found in the directory tree. */
if(files && files.length > 0) {
  files.forEach(function(fileName) {
    var mapping = apiRoot + fileName.replace(mockRoot, '').replace(path.extname(fileName), '');

    app.all(mapping, function (req, res) {
      if(debug) {
        dumpRequest(req);
      }
      var data =  fs.readFileSync(fileName, 'utf8');

      if(path.extname(fileName) === ".json"){
        res.writeHead(200, { 'Content-Type': 'application/json' });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
      }
      res.write(data);
      res.end();
    });

    console.log('Registered mapping: %s -> %s', mapping, fileName);
  })
} else {
    console.log('No mappings found! Please check the configuration.');
}

/*
 * Routes where we can't just serve a file but instead have to look at the request.
 */
app.all('/ip/service/rbc/GetAccountDetailsAndTransactionHistory', function (req, res) {
  var detailsRoot = applicationRoot + '/data/AccountDetailsAndTransactionHistory/';
  var accountNumber = req.body['ns2:rbcaccountdetailrequest']['user'][0]['subaccount'][0]['accountnumber'];
  var data =  fs.readFileSync(detailsRoot + accountNumber + '.xml', 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/xml' });
  res.write(data);
  res.end();
});

app.all('/ip/service/rbc/GetRealTimeAccountDetailsAndTransactions', function (req, res) {
  var detailsRoot = applicationRoot + '/data/RealTimeAccountDetailsAndTransactionHistory/';
  var accountNumber = req.body['p:rbcrealtimeaccountdetailrequest']['user'][0]['subaccount'][0]['accountnumber'];
  var data =  fs.readFileSync(detailsRoot + accountNumber + '.xml', 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/xml' });
  res.write(data);
  res.end();
});

/*
 * If no match we return what was requested so we know what we need to respond to.
 */
app.all('*', function (req, res) {
  var data =  'No matching route, details:\n' + stringifyRequest(req);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write(data);
  res.end();
  if(debug) {
    console.log('\n*****\n' + data + '\n*****\n');
  }
});

/* Start the API mock server. */
console.log('Application root directory: [' + applicationRoot +']');

// Default port
var port = 8080;

if(process.env.NODE_ENV = 'production') {
  port = 8081; // AWS Beanstalk by default sets up Nginx proxy the forward 80 -> 8081
}

// Create an HTTP service.
var server = http.createServer(app)
server.listen(port);
console.log('Mock Api Server listening on port: ' + server.address().port);
