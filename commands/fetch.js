

var git = require('gift');
var Q = require('q');

var currentPath = process.cwd();
var repo = git(currentPath);

var commits = [];

var gitCurrent = function () {
  var deferred = Q.defer();

  repo.current_commit(function(err, commit) {
    if (err) {
      deferred.reject(err);
    }

    commits.push(commit);
    deferred.resolve();
  });

  return deferred.promise;
};

var gitPull = function () {
  var deferred = Q.defer();

  repo.pull (function(err) {
    if (err) {
      deferred.reject(err);
    }

    deferred.resolve();
  });

  return deferred.promise;
};

var checkCommitDiff = function () {
  if (commits[0].id === commits[1].id) {
    console.log('Your project has not finished running.  Please try again later!');
  } else {
    console.log('Your project is complete! Please find your files in the "output" folder.');
  }
};


var fetch = function () {
  gitCurrent()
  .then(gitPull)
  .then(gitCurrent)
  .then(checkCommitDiff)
  .catch(console.log);
};

module.exports = fetch;
