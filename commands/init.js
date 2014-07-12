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
var http = require('http');
var git = require('gift');
var Q = require('q');

var homepath = utils.getUserHome();
var cwdPath = process.cwd();

var azixconfigPath = path.join(homepath, '.azixconfig');
var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

var azixJSON = {};

var promptProjectName = function () {
  var deferred = Q.defer();

  inquirer.prompt([{
    type:'input',
    name:'projectName',
    message:'Please input your (unique) azix project name'
  }], function(answer){
    deferred.resolve(answer.projectName);
  });

  return deferred.promise;
};

var createAzixJSON = function(projectName) {
  var deferred = Q.defer();

  azixJSON.username = azixconfig.username;
  azixJSON.password = azixconfig.password;
  azixJSON.projectName = projectName;
  azixJSON.timestamp = (new Date()).toString();

  deferred.resolve();

  return deferred.promise;
};

var notifyServer = function () {
  var deferred = Q.defer();

  var req = http.request({
    method: 'POST',
    hostname: serverUtils.serverURL,
    port: serverUtils.serverPORT,
    path: serverUtils.serverAPIINIT,
  }, function(res) {
    var resBody;
    res.on('data', function (chunk) {
      resBody += chunk;
    });
    res.on('end', function() {
      deferred.resolve(JSON.parse(resBody));
    });
  });

  // server checks for unique project name
  req.on('error', function(err) {
    if (err.message = 'project name taken') {
      deferred.reject('Error: Project name not unique. Restarting...');
    } else {
      deferred.reject(err);
    }
  });

  req.write(JSON.stringify(azixJSON));
  req.end();

  return deferred.promise;
};

var clonePristineRepo = function(responseObject) {
  var deferred = Q.defer();

  var repoURL = responseObject.endpoint;
  var projectPath = path.join(cwdPath, azixJSON.projectName);
  // perhaps validate that directory called projectName doesn't already exist in this folder?
  git.clone(repoURL, projectPath, function(err) {
    if (err) {
      deferred.reject(err);
    }
    fs.writeFileSync(path.join(projectPath, 'azix.json'), azixJSON);
    deferred.resolve('Project initiated!');
  });

  return deferred.promise;
};

var init = function () {
  promptProjectName()
  .then(createAzixJSON)
  .then(notifyServer)
  .then(function(responseObj) {
    clonePristineRepo(responseObj);
  }, function(err) {
    console.log(err);
    init();
  })
  .then(function(successOutput) {
    console.log(successOutput);
  })
  .catch(console.log);
};

module.exports = init;
