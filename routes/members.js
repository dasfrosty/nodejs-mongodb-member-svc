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

  server.put('/auth', function (req, res, next) {
    // console.dir(req.body);
    var cmd = req.body;
    console.log('/auth: cmd = %s', JSON.stringify(cmd));
    Member.find({ username: cmd.who }, function (err, members) {
      if (err) throw err;
      console.dir(members);
      if (members && members[0] && members[0].password == cmd.password) {
        res.send(members[0]);
        return next();
      };
      var errorResponse = {
        status: 'failure',
        reason: 'invalid_credentials'
      };
      res.send(errorResponse);
      next();
    });
  });

};
