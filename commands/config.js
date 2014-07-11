var fs = require('fs');
var path = require('path');
var inquirer = require("inquirer");

// Returns the User's Home directory irrespective of operating system. Untested on Windows.
var getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};


// Global variables storing necessary paths
var homepath = getUserHome();
var asixPath = path.join(homepath, '.asix');


// Global object that stores user information
var userInformation = {};


// Exported function that creates the global asix folder
var config = function () {
  if (!fs.existsSync(asixPath)) {
    fs.mkdirSync(asixPath);
  }
  configQuestions();
};


// Prompts user for information (username, password) and saves them to global variable
// HIGHLY UNSAFE AS PASSWORDS ARE IN PLAINTEXT
var configQuestions = function() {
  var questions = [
    {
      type: "input",
      name: "username",
      message: "Please input your asix username"
    },
    {
      type: "password",
      message: "Please input your asix password",
      name: "password"
    }
  ];
  inquirer.prompt(questions, function(answers) {
    userInformation = answers;
  });
};

module.exports = config;
