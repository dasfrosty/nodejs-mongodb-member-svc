var restifyMongoose = require('restify-mongoose');

module.exports = function (mongoose, server) {

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

};
