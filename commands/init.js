var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils.js');
var serverUtils = require('../lib/serverutils.js');
var http = require('http');
var git = require('gift');

// Global variables storing necessary paths
var homepath = utils.getUserHome();
var cwdPath = process.cwd();
var azixconfigPath = path.join(homepath, '.azixconfig');
var azixJSONPath = path.join(cwdPath, 'azix.json');


// Object storing our json file preferences && user information
var azixJSON = {};


// Initiate the JSON preference file creation
var createAzixJSON = function() {
  // reads global user information from home directory
  var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

  azixJSON.username = azixconfig.username;
  azixJSON.password = azixconfig.password;
  azixJSON.timestamp = new Date();

};

var promptProjectName = function () {
  inquirer.prompt([{
    type:'input',
    name:'projectName',
    message:'Please input your unique azix project name'
  }], function(answer){
    azixJSON.projectName = answer.projectName;
  });
};


var clonePristineRepo = function(responseObject) {
  var repoURL = responseObject.endpoint;

  git.clone(repoURL, path.join(cwdPath, '??????'), function(err, repo) {
    if (err) {console.log(err);}
    console.log(repo);
  });
};


// sends a post request notifying the server of input sources added by the user initiating a chain of commands
var notifyServer = function () {
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

    clonePristineRepo(JSON.parse(resBody));
  });

  req.on('error', function(err) {
    if (err.message = 'project name taken') {
      init();
    }
  });

  // send user information as POST request body
  req.write(JSON.stringify(azixJSON));
  req.end();
};


// main init function (exported)
var init = function () {
  promptProjectName();
  createAzixJSON();
  notifyServer();
};

module.exports = init;
