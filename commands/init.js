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

// Global variables storing necessary paths
var homepath = utils.getUserHome();
var cwdPath = process.cwd();
var azixconfigPath = path.join(homepath, '.azixconfig');

// Object storing our json file preferences && user information
var azixJSON = {};


// Ask for a unique project name from the user
var promptProjectName = function () {
  inquirer.prompt([{
    type:'input',
    name:'projectName',
    message:'Please input your (unique) azix project name'
  }], function(answer){
    azixJSON.projectName = answer.projectName;
  });
};


// Create azix JSON object (stored in memory)
var createAzixJSON = function() {
  // reads global user information from home directory
  var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

  azixJSON.username = azixconfig.username;
  azixJSON.password = azixconfig.password;
  azixJSON.timestamp = new Date();

};


var clonePristineRepo = function(responseObject) {
  var repoURL = responseObject.endpoint;
  var projectPath = path.join(cwdPath, azixJSON.projectName);
  // perhaps validate that directory called projectName doesn't already exist?
  git.clone(repoURL, projectPath, function(err) {
    if (err) {
      console.log(err);
    }
    fs.writeFileSync(path.join(projectPath, 'azix.json'), azixJSON);
    console.log('Project initiated!');
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

  // server checks for unique project name
  req.on('error', function(err) {
    if (err.message = 'project name taken') {
      // redo prompt if project name taken
      console.log('Error: Project name not unique. Restarting...');
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
