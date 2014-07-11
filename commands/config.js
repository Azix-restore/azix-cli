var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils.js');

// Global variables storing necessary paths
var homepath = utils.getUserHome();
var azixconfigPath = path.join(homepath, '.azixconfig');


// Global object that stores user information
var userInformation = {};

// Prompts user for information (username, password) and saves them to global variable
// HIGHLY UNSAFE AS PASSWORDS ARE IN PLAINTEXT
var configQuestions = function() {
  var questions = [
    {
      type: 'input',
      name: 'username',
      message: 'Please input your azix username'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please input your azix password'
    }
  ];
  inquirer.prompt(questions, function(answers) {
    userInformation = answers;
    fs.writeFileSync(azixconfigPath, JSON.stringify(userInformation));
  });
};

// Exported function that creates the global azix folder
var config = function () {
  configQuestions();
};

module.exports = config;
