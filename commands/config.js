var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var Q = require('q');
var utils = require('../lib/utils.js');

var homepath = utils.getUserHome();
var azixconfigPath = path.join(homepath, '.azixconfig');

var userInformation = {};

var config = function () {
  /*
    Configures Azix on this computer for this user

    1. Prompts user for username and password
    2. Writes this information to file called .azixconfig in the user's home directory
  */
  return configQuestions();
};

var configQuestions = function() {
  var deferred = Q.defer();

  var questions = [
    {
      type: 'input',
      name: 'user',
      message: 'Please input your azix username'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please input your azix password'
    }
  ];

  inquirer.prompt(questions, function(userInfo) {
    // HIGHLY UNSAFE AS PASSWORDS ARE IN PLAINTEXT
    fs.writeFileSync(azixconfigPath, JSON.stringify(userInfo));
    deferred.resolve();
  });

  return deferred.promise
};

module.exports = config;
