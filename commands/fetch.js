var git = require('gift');
var Q = require('q');

var currentPath = process.cwd();
var repo = git(currentPath);

var commits = [];

var fetch = function () {
  /*
    Attempts to fetch output from the server using "git pull."

    1. Pushes current commit into temp array, for comparison later
    2. "Pulls" from remote origin master
    3. Pushes new commit into temp array, for comparison
    4a. If commit SHA ID has changed after pull, notifies user that process is complete
    4b. Else, notify user that process is still incomplete.

  */

  gitCurrent()
  .then(gitPull)
  .then(gitCurrent)
  .then(checkCommitDiff)
  .catch(console.log);
};

var gitCurrent = function () {
  var deferred = Q.defer();

  repo.current_commit(function(err, commit) {
    if (err) {
      deferred.reject(new Error(err));
    }

    commits.push(commit);
    deferred.resolve();
  });

  return deferred.promise;
};

var gitPull = function () {
  var deferred = Q.defer();

  repo.pull(deferred.makeNodeResolver());

  return deferred.promise;
};

var checkCommitDiff = function () {
  if (commits[0].id === commits[1].id) {
    console.log('Your project has not finished running.  Please try again later!');
  } else {
    console.log('Your project is complete! Please find your files in the "output" folder.');
  }
};

module.exports = fetch;
