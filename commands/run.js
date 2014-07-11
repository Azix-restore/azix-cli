// Assume user has cd'd into the azix project folder and added files to the requisite folders

var Q = require('q');
var path = require('path');
var git = require('gift');
var http = require('http');
var fs = require('fs');
var serverUtils = require('../lib/serverutils.js');

var currentPath = process.cwd();

var azixJSON = fs.readFileSync(path.join(currentPath, 'azix.json'), {encoding:'utf8'});

var repo = git(currentPath);


var gitAdd = function(folder) {
  var deferred = Q.defer();

  repo.add(path.join(currentPath, folder), function(err){
    if(err) {
      deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred;
};

var gitCommit = function () {
  var deferred = Q.defer();

  repo.commit((new Date()).toString(), function(err){
    if(err) {
      deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred;
};

var gitPush = function () {
  var deferred = Q.defer();

  repo.remote_push('origin', 'master', function(err){
    if(err) {
      deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred;
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
      deferred.resolve();
    });
  });

  req.on('error', function(err) {
    deferred.reject(err.message);
  });

  req.write(azixJSON);
  req.end();

  return deferred;
};


var run = function () {
  gitAdd('scripts')
  .then(function(){
    gitAdd('data');
  })
  .then(gitCommit)
  .then(gitPush)
  .then(notifyServer)
  .catch(function(err) {
    console.log(err);
  });
};

module.exports = run;
