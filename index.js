#!/usr/bin/env node
var program = require('commander');
var config = require('./commands/config.js');
var init = require('./commands/init.js');
var run = require('./commands/run.js');
var fetch = require('./commands/fetch.js');

program
  .version(require('./package.json').version);

program
  .command('config')
  .description('configure')
  .action(config);

program
  .command('init')
  .description('initialize')
  .action(init);

program
  .command('run')
  .description('Start an EC2 instance and execute your code')
  .action(run);

program
  .command('fetch')
  .description('Fetch output from EC2 instance')
  .action(fetch);

program.parse(process.argv);

module.exports = program;
