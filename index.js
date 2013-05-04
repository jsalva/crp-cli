#!/usr/bin/env node
var optimist = require('optimist');
var auth = require('./auth');
var args = process.argv;
var arg0 = args.shift();

args.shift()

var command = args.shift();

var commands = require('./commands');

if (! command) {
  console.error('Usage: ' + arg0 + ' <command>\n' +
    'List of available commands:\n' +
    commands.list().map(bullet).join('\n'));
  process.exit(-1);
}

if (! ~commands.list().indexOf(command)) {
  console.error('Unknown command:', command);
  process.exit(-1);
}

var args = optimist(args);
var module = commands.module(command);
if (module.usage) module.usage(command, args);

var authToken;
if (module.requiresAuth) {
  authToken = auth.getToken();
  if (! authToken) {
    console.error('You need to login first'.red);
    process.exit(-1);
  }
}

module(args.argv, authToken);

function bullet(s) {
  return '\t' + s;
}