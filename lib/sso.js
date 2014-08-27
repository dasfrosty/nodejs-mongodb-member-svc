var restify = require('restify');
var restifyMongoose = require('restify-mongoose');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test_restify_mongoose');

var server = restify.createServer({
  name: 'sso',
  version: '0.0.0'
});

// server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

var MemberSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, trim: true }
});

var Member = mongoose.model('members', MemberSchema);

var members = restifyMongoose(Member);

// members routes
// server.get('/members', members.query());
server.get('/members/:id', members.detail());
server.post('/members', members.insert());
// server.patch('/members/:id', members.update());
// server.del('/members/:id', members.remove());

server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});
