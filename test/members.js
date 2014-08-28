var should = require('should');
var request = require('supertest');

var createServer = require(__dirname + '/../lib/server.js');

var mongodbUrl = 'mongodb://localhost:27017/test_sso';
var restBaseUrl = 'http://localhost:3000'

var unique = new Date().getTime();
var uniqueMember = function () {
  var timestamp = unique++;
  return {
    username: 'example' + timestamp,
    email: 'example-' + timestamp + '@example.com',
    password: 'pa$$werd'
  };
}

describe('SSO REST', function () {

  before(function (done) {
    var server = createServer(mongodbUrl);
    server.listen(3000, function () {
      console.log('%s listening at %s', server.name, server.url);
      done();
    });
  });

  describe('Member API', function () {

    it('should create and return a member', function (done) {
      var expected = uniqueMember();
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .get('/members/' + expectedId)
            .accept('application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(expected.username);
              res.body.email.should.equal(expected.email);
              res.body.password.should.equal(expected.password);
              done();
            });
        });
    });

    it('should not allow duplicate usernames', function (done) {
      var expected = uniqueMember();
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var username = expected.username;
          expected = uniqueMember();
          expected.username = username;
          request(restBaseUrl)
            .post('/members')
            .accept('application/json')
            .send(expected)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res) {
              should.not.exist(err);
              should.exist(res.body.message);
              done();
            });
        });
    });

    it('should not allow a member to be created with an invalid email', function (done) {
      var expected = uniqueMember();
      expected.email = expected.username;
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res.body.message);
          done();
        });
    });

    it('should not allow duplicate emails', function (done) {
      var expected = uniqueMember();
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var email = expected.email;
          expected = uniqueMember();
          expected.email = email;
          request(restBaseUrl)
            .post('/members')
            .accept('application/json')
            .send(expected)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res) {
              should.not.exist(err);
              should.exist(res.body.message);
              done();
            });
        });
    });

    it('should allow updating a members email address', function (done) {
      var expected = uniqueMember();
      var patch = {
        email: uniqueMember().email
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .patch('/members/' + expectedId)
            .accept('application/json')
            .send(patch)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(expected.username);
              res.body.email.should.equal(patch.email);
              res.body.password.should.equal(expected.password);
              var oldAuth = {
                who: expected.email,
                password: expected.password
              }
              request(restBaseUrl)
                .put('/auth')
                .accept('application/json')
                .send(oldAuth)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                  should.not.exist(err);
                  should.not.exist(res.body._id);
                  should.not.exist(res.body.username);
                  should.not.exist(res.body.email);
                  should.not.exist(res.body.password);
                  console.dir(res.body.status);
                  res.body.status.should.equal('failure');
                  console.dir(res.body.reason);
                  should.exist(res.body.reason);
                  var auth = {
                    who: patch.email,
                    password: expected.password
                  }
                  request(restBaseUrl)
                    .put('/auth')
                    .accept('application/json')
                    .send(auth)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                      should.not.exist(err);
                      should.not.exist(res.body.status);
                      should.not.exist(res.body.reason);
                      res.body._id.should.equal(expectedId);
                      res.body.username.should.equal(expected.username);
                      res.body.email.should.equal(patch.email);
                      res.body.password.should.equal(expected.password);
                      done();
                    });
                });
            });
        });
    });

    it('should allow updating a members username', function (done) {
      var expected = uniqueMember();
      var patch = {
        username: uniqueMember().username
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .patch('/members/' + expectedId)
            .accept('application/json')
            .send(patch)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(patch.username);
              res.body.email.should.equal(expected.email);
              res.body.password.should.equal(expected.password);
              var auth = {
                who: patch.username,
                password: expected.password
              }
              request(restBaseUrl)
                .put('/auth')
                .accept('application/json')
                .send(auth)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                  should.not.exist(err);
                  should.not.exist(res.body.status);
                  should.not.exist(res.body.reason);
                  res.body._id.should.equal(expectedId);
                  res.body.username.should.equal(patch.username);
                  res.body.email.should.equal(expected.email);
                  res.body.password.should.equal(expected.password);
                  done();
                });
            });
        });
    });

    it('should allow updating a members password', function (done) {
      var expected = uniqueMember();
      var patch = {
        password: 'x' + expected.password
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .patch('/members/' + expectedId)
            .accept('application/json')
            .send(patch)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(expected.username);
              res.body.email.should.equal(expected.email);
              res.body.password.should.equal(patch.password);
              var oldAuth = {
                who: expected.email,
                password: expected.password
              }
              request(restBaseUrl)
                .put('/auth')
                .accept('application/json')
                .send(oldAuth)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                  should.not.exist(err);
                  should.not.exist(res.body._id);
                  should.not.exist(res.body.username);
                  should.not.exist(res.body.email);
                  should.not.exist(res.body.password);
                  console.dir(res.body.status);
                  res.body.status.should.equal('failure');
                  console.dir(res.body.reason);
                  should.exist(res.body.reason);
                  var auth = {
                    who: expected.email,
                    password: patch.password
                  }
                  request(restBaseUrl)
                    .put('/auth')
                    .accept('application/json')
                    .send(auth)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                      should.not.exist(err);
                      should.not.exist(res.body.status);
                      should.not.exist(res.body.reason);
                      res.body._id.should.equal(expectedId);
                      res.body.username.should.equal(expected.username);
                      res.body.email.should.equal(expected.email);
                      res.body.password.should.equal(patch.password);
                      done();
                    });
                });
            });
        });
    });

  });

  describe('Auth API', function () {

    it('should allow login with username', function (done) {
      var expected = uniqueMember();
      var auth = {
        who: expected.username,
        password: expected.password
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .put('/auth')
            .accept('application/json')
            .send(auth)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should.not.exist(res.body.status);
              should.not.exist(res.body.reason);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(expected.username);
              res.body.email.should.equal(expected.email);
              res.body.password.should.equal(expected.password);
              done();
            });
        });
    });

    it('should prevent login with missing credentials', function (done) {
      var expected = uniqueMember();
      var auth = {
        who: '',
        password: ''
      };
      request(restBaseUrl)
        .put('/auth')
        .accept('application/json')
        .send(auth)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          should.not.exist(res.body._id);
          should.not.exist(res.body.username);
          should.not.exist(res.body.email);
          should.not.exist(res.body.password);
          res.body.status.should.equal('failure');
          should.exist(res.body.reason);
          done();
        });
    });

    it('should prevent login with non-existent username', function (done) {
      var expected = uniqueMember();
      var auth = {
        who: 'x' + expected.username,
        password: expected.password
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .put('/auth')
            .accept('application/json')
            .send(auth)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should.not.exist(res.body._id);
              should.not.exist(res.body.username);
              should.not.exist(res.body.email);
              should.not.exist(res.body.password);
              res.body.status.should.equal('failure');
              should.exist(res.body.reason);
              done();
            });
        });
    });

    it('should prevent login with bad password', function (done) {
      var expected = uniqueMember();
      var auth = {
        who: expected.username,
        password: 'x' + expected.password
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .put('/auth')
            .accept('application/json')
            .send(auth)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should.not.exist(res.body._id);
              should.not.exist(res.body.username);
              should.not.exist(res.body.email);
              should.not.exist(res.body.password);
              console.dir(res.body.status);
              res.body.status.should.equal('failure');
              console.dir(res.body.reason);
              should.exist(res.body.reason);
              done();
            });
        });
    });

    it('should allow login with email', function (done) {
      var expected = uniqueMember();
      var auth = {
        who: expected.email,
        password: expected.password
      };
      request(restBaseUrl)
        .post('/members')
        .accept('application/json')
        .send(expected)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.username.should.equal(expected.username);
          res.body.email.should.equal(expected.email);
          res.body.password.should.equal(expected.password);
          var expectedId = res.body._id;
          request(restBaseUrl)
            .put('/auth')
            .accept('application/json')
            .send(auth)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should.not.exist(res.body.status);
              should.not.exist(res.body.reason);
              res.body._id.should.equal(expectedId);
              res.body.username.should.equal(expected.username);
              res.body.email.should.equal(expected.email);
              res.body.password.should.equal(expected.password);
              done();
            });
        });
    });

  });

});
