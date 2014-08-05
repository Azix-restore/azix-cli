var fs = require('fs');
var git = require('gift');
var inquirer = require('inquirer');
var path = require('path');
var Q = require('q');
var request = require('request');

var utils = require('../lib/utils.js');
var serverUtils = require('../config.js');
var config = require('./config.js');

var homepath = utils.getUserHome();
var cwdPath = process.cwd();
var azixconfigPath = path.join(homepath, '.azixconfig');

var azixJSON = {};

var init = function (projectname) {
  /*
    Creates a new Azix project in the current directory.

    1. Prompts user for a unique project name, if not provided as argument to "azix init" command
    2. If .azixconfig does not exist, call "azix config"
    3. Creates azixJSON object to store username, password, and projectname
    4. Sends POST request to server, notifying it of the new project
    5a. If the server detects no error, clones down the project repository using git
    5b. If there is an error (such as a non-unique projectname), logs that error and restarts the init() process.

    arguments:
    projectname - optional
  */

  promptProjectName(projectname)
  .then(checkAzixconfig)
  .then(createAzixJSON)
  .then(notifyServer)
  .then(clonePristineRepo)
  .then(console.log)
  .catch(function(err) {
    console.log(err);
    init();
  });
};

var promptProjectName = function (projectname) {
  var deferred = Q.defer();

  // This is a hacky way to check if projectname is passed in as argument
  if (typeof(projectname)==='string') {
    deferred.resolve(projectname)
  } else {
    inquirer.prompt([{
      type:'input',
      name:'projectName',
      message:'Please input your (unique) azix project name'
    }], function(answer){
      deferred.resolve(answer.projectName);
    });
  }

  return deferred.promise;
};

var checkAzixconfig = function (projectname) {
  var deferred = Q.defer();

  fs.exists(azixconfigPath, function(exists) {
    if (! exists) {
      config()
      .then(function() {
        deferred.resolve(projectname);
      });
    } else {
      deferred.resolve(projectname);
    }
  })

  return deferred.promise;
}

var createAzixJSON = function (projectname) {
  var deferred = Q.defer();

  azixJSON.project = projectname;

  var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

  azixJSON.user = azixconfig.user;
  azixJSON.password = azixconfig.password;

  deferred.resolve(azixJSON);

  return deferred.promise;
};

var notifyServer = function (data) {
  var deferred = Q.defer();

  var options = {
    method: 'POST',
    url: 'http://' + serverUtils.serverURL + ':' + serverUtils.serverPORT + serverUtils.serverAPIINIT,
    json: data
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

var clonePristineRepo = function(responseObject) {
  var deferred = Q.defer();

  var repoURL = responseObject.endpoint;
  var projectPath = path.join(cwdPath, azixJSON.project);
  // perhaps validate that directory called projectname doesn't already exist in this folder?
  git.clone(repoURL, projectPath, function(err) {
    if (err) {
      deferred.reject(new Error(err));
    }
    fs.writeFileSync(path.join(projectPath, 'azix.json'), JSON.stringify(azixJSON));
    deferred.resolve('Project initiated!');
  });

  return deferred.promise;
};

module.exports = init;
