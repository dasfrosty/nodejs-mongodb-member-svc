var createServer = require(__dirname + '/lib/server.js');

var mongodbUrl = 'mongodb://localhost:27017/test_restify_mongoose';

var server = createServer(mongodbUrl);
server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});
