// azix init (client)
//   -> create a azix.json local repository file that contains “username (found from global else prompt), project name, unique  identifier of a timestamp”
//   -> creates a repo on the azix server by sending a POST request with asix.json as body. POST request response should be url of server repo. Error - message from server
//   -> clones down that repo from server using git clone (gift)
//     -> said folder should contain three directories without removing any existing data

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils.js');
var serverUtils = require('../lib/serverutils.js');
var request = require('request');
var git = require('gift');
var Q = require('q');

var homepath = utils.getUserHome();
var cwdPath = process.cwd();
var azixconfigPath = path.join(homepath, '.azixconfig');


var azixJSON = {};

var promptProjectName = function (projectname) {
  var deferred = Q.defer();

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

var createAzixJSON = function(projectName) {
  var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

  var deferred = Q.defer();

  azixJSON.user = azixconfig.user;
  azixJSON.password = azixconfig.password;
  azixJSON.project = projectName;
  // azixJSON.timestamp = (new Date()).toString();

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
  // perhaps validate that directory called projectName doesn't already exist in this folder?
  git.clone(repoURL, projectPath, function(err) {
    if (err) {
      deferred.reject(new Error(err));
    }
    fs.writeFileSync(path.join(projectPath, 'azix.json'), JSON.stringify(azixJSON));
    deferred.resolve('Project initiated!');
  });

  return deferred.promise;
};

var init = function (projectname) {

  promptProjectName(projectname)
  .then(createAzixJSON)
  .then(notifyServer)
  .then(function(responseObj) {
    return clonePristineRepo(responseObj);
  })
  .then(function(successOutput) {
    console.log(successOutput);
  })
  .catch(function(err) {
    console.log(err);
    init();
  });
};

module.exports = init;
