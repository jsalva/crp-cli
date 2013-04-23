var optimist = require('optimist');
var args = process.argv;
var arg0 = args.shift();

args.shift()

var command = args.shift();

var commands = require('./commands');

if (! command) {
  console.error('Usage: ' + arg0 + ' <comand>\n' +
    'Available commands:\n' +
    commands.list().join('\n'));
  process.exit(-1);
}

if (! ~commands.list().indexOf(command)) {
  console.error('Unknown command:', command);
  process.exit(-1);
}

var args = optimist(args);
var module = commands.module(command);
if (module.usage) module.usage(command, args);

module(args.argv);