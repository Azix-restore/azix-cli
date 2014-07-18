// Assume user has cd'd into the azix project folder and added files to the requisite folders

var fs = require('fs');
var request = require('request');
var path = require('path');
var git = require('gift');
var Q = require('q');
var serverUtils = require('../lib/serverutils.js');

var currentPath = process.cwd();

var repo = git(currentPath);


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

  var azixJSON = fs.readFileSync(path.join(currentPath, 'azix.json'), {encoding:'utf8'});

  var options = {
    method: 'POST',
    url: 'http://' + serverUtils.serverURL + ':' + serverUtils.serverPORT + serverUtils.serverAPIRUN,
    json: JSON.parse(azixJSON)
  };
  request(options, function(err, res, body) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve(body);
    }
  });

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
