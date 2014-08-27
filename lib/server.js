var restify = require('restify');
var mongoose = require('mongoose');

var routes = require(__dirname + '/../routes/members.js');

module.exports = function (mongodbUrl) {

  // connect to mongodb
  mongoose.connect(mongodbUrl);

  // initialize restify server
  var server = restify.createServer({
    name: 'sso',
    version: '0.0.0'
  });

  // server.pre(restify.pre.userAgentConnection());
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  // setup routes
  routes(mongoose, server);

  return server;
};
