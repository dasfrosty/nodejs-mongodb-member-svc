var restifyMongoose = require('restify-mongoose');
var validator = require('validator');

var invalidCredentials = {
  status: 'failure',
  reason: 'invalid_credentials'
};

module.exports = function (mongoose, server) {

  var MemberSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, validate: validator.isEmail },
    password: { type: String, required: true, trim: true }
  });

  var Member = mongoose.model('members', MemberSchema);

  var members = restifyMongoose(Member);

  // members routes
  // server.get('/members', members.query());
  server.get('/members/:id', members.detail());
  server.post('/members', members.insert());
  server.patch('/members/:id', members.update());
  // server.del('/members/:id', members.remove());

  server.put('/auth', function (req, res, next) {
    // console.dir(req.body);
    var cmd = req.body;
    // console.log('/auth: cmd = %s', JSON.stringify(cmd));
    if (!cmd.who || !cmd.password) {
      // console.log('missing credentials');
      res.send(invalidCredentials);
      return next();
    }
    var who = cmd.who.toLowerCase();
    var criteria = validator.isEmail(who) ? { email: who } : { username: who };
    Member.find(criteria, function (err, members) {
      if (err) throw err;
      // console.dir(members);
      if (members && members[0] && members[0].password == cmd.password) {
        res.send(members[0]);
        return next();
      };
      res.send(invalidCredentials);
      next();
    });
  });

};
