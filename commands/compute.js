require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var JSONStream = require('JSONStream');

var JobClient = require('job-client');

exports =
module.exports = compute;

module.exports.requiresAuth = true;

function compute(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No job id specified');
    process.exit(-1);
  }

  var client = JobClient({credential: credential});

  var ee = client.jobs.compute(jobId);

  ee.on('no job', function() {
    console.error('Couldn\'t find job with id %s', jobId);
    process.exit(-1);
  });

  ee.on('job', function(j) {
    console.log('Job %s found: %j', jobId, j);
  });

  ee.on('data', function(d) {
    console.log('got data unit:', d);
  });

  ee.on('result', function(d, r) {
    console.log('result is %j', r);
  });

  ee.on('end', function() {
    console.log('job ended.');
    process.exit(0);
  });

  ee.on('submitted', function() {
    console.log('result successfully submitted');
  });
};