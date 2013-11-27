require('colors');

var assert      = require('assert');
var fs          = require('fs');
var inspect     = require('util').inspect;
var read        = require('read');
var JobClient   = require('crp-job-client');

exports =
module.exports = job;

module.exports.requiresAuth = true;

module.exports.usage = usage;
function usage(name, args) {
  args.
    alias('p', 'program-file').
    demand('program-file').
    alias('b', 'bid').
    alias('g', 'group').
    alias('y', 'confirm');
    // demand('bid'); // FIXME: Don't need bids for now
}

function job(args, token) {
  if (! fs.existsSync(args.p)) {
    console.error('program file not found: ' + args.p);
    process.exit(1);
  }

  var program = fs.readFileSync(args.p, 'utf8');

  var options = {
    // FIXME: Don't need bids for now
    bid: args.bid || 1,
    group: args.group,
    dataFilePath: args.d,
    program: program,
    token: token
  };

  if (args.y)
    return proceed(options);

  console.log('About to create a job with these options:\n%s'.yellow, inspect(
    args.debug
    ? options
    : { programFile: args.p }).yellow);

  read({
    prompt: 'Confirm? [y,n]',
    default: 'y'
  }, function(err, answer) {
    if (answer && answer.toLowerCase() == 'y')
      proceed(options);
  });


};

function proceed(options) {
  var jobClient = JobClient({
    token: options.token
  });

  jobClient.create({
    bid: options.bid,
    group: options.group,
    program: options.program
  }, afterTaskCreated);
};

function afterTaskCreated(err, job) {
  if (err) throw err;

  assert(job, 'No job has been created.');
  console.log('Job successfully created.\nJob Id: ', job.id.green);
}

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
}
