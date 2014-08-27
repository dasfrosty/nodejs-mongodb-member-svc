
// TODO: move service init to before() method
var sso = require(__dirname + '/../lib/sso.js');


var should = require('should');
var request = require('supertest');

var restBaseUrl = 'http://localhost:3000'

var uniqueMember = function () {
  var timestamp = new Date().getTime();
  return {
    username: 'example' + timestamp,
    email: 'example-' + timestamp + '@example.com',
    password: 'pa$$werd'
  };
}

describe('SSO REST', function () {

  before(function (done) {
    // TODO: move initialization here
    done();
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

  });

});
