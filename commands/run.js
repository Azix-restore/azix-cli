// Assume user has cd'd into the azix project folder and added files to the requisite folders

var Q = require('q');
var path = require('path');
var git = require('gift');
var http = require('http');

var currentPath = process.cwd();

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

  repo.commit(currentPath, function(err){
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

// var notifyServer = function () {

// };


var run = function () {
  gitAdd('scripts')
  .then(function(){
    gitAdd('data');
  })
  .then(function(){
    gitAdd('output'); // Should this even happen?
  })
  .then(gitCommit)
  .then(gitPush);
};

module.exports = run;
