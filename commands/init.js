var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var utils = require('../lib/utils');

// Global variables storing necessary paths
var homepath = utils.getUserHome();
var cwdPath = process.cwd();

var azixconfigPath = path.join(homepath, '.azixconfig');
var azixJSONPath = path.join(cwdPath, 'azix.json');


var createAzixJSON = function() {
  var azixJSON = {};
  var azixconfig = JSON.parse(fs.readFileSync(azixconfigPath, {encoding:'utf8'}));

  azixJSON.username = azixconfig.username;
  azixJSON.password = azixconfig.password;
  azixJSON.timestamp = new Date();

  fs.writeFileSync(azixJSONPath, JSON.stringify(azixJSON));
};

var init = function () {
  createAzixJSON();
};

module.exports = init;
