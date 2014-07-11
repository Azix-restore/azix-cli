var fs = require('fs');
var path = require('path');
var inquirer = require("inquirer");

// Returns the User's Home directory irrespective of operating system. Untested on Windows.
var getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

// Global variables storing necessary paths
var homepath = getUserHome();
var azixPath = path.join(homepath, '.azixconfig');


// Global object that stores user information
var userInformation = {};

// Prompts user for information (username, password) and saves them to global variable
// HIGHLY UNSAFE AS PASSWORDS ARE IN PLAINTEXT
var configQuestions = function() {
  var questions = [
    {
      type: "input",
      name: "username",
      message: "Please input your azix username"
    },
    {
      type: "password",
      name: "password",
      message: "Please input your azix password"
    }
  ];
  inquirer.prompt(questions, function(answers) {
    userInformation = answers;
    fs.writeFileSync(azixPath, JSON.stringify(userInformation));
  });
};

// Exported function that creates the global azix folder
var config = function () {
  configQuestions();
};

module.exports = config;
