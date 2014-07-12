// Assume user has cd'd into the azix project folder and added files to the requisite folders

var fs = require('fs');
var http = require('http');
var path = require('path');
var git = require('gift');
var Q = require('q');
var serverUtils = require('../lib/serverutils.js');

var currentPath = process.cwd();

var repo = git(currentPath);

var azixJSON = fs.readFileSync(path.join(currentPath, 'azix.json'), {encoding:'utf8'});

var gitAdd = function(folder) {
  var deferred = Q.defer();

  repo.add(path.join(currentPath, folder), deferred.makeNodeResolver());

  return deferred.promise;
};

var gitCommit = function () {
  var deferred = Q.defer();

  repo.commit((new Date()).toString(), deferred.makeNodeResolver());

  return deferred.promise;
};

var gitPush = function () {
  var deferred = Q.defer();

  repo.remote_push('origin', 'master', deferred.makeNodeResolver());

  return deferred.promise;
};

var notifyServer = function () {
  var deferred = Q.defer();

  var req = http.request({
    method: 'POST',
    hostname: serverUtils.serverURL,
    port: serverUtils.serverPORT,
    path: serverUtils.serverAPIRUN,
  }, function(res) {
    var resBody;
    res.on('data', function (chunk) {
      resBody += chunk;
    });
    res.on('end', function() {
      deferred.resolve(resBody);
    });
  });

  req.on('error', function(err) {
    deferred.reject(err.message);
  });

  req.write(azixJSON);
  req.end();

  return deferred.promise;
};

var run = function () {
  gitAdd('scripts')
  .then(function(){
    gitAdd('data');
  })
  .then(gitCommit)
  .then(gitPush)
  .then(notifyServer)
  .then(console.log)
  .catch(console.log);
};

module.exports = run;
