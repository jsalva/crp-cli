require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var read       = require('read');
var JSONStream = require('JSONStream');
var multimeter = require('multimeter')

var JobClient = require('crp-job-client');
var JobProducerClient = require('crp-job-producer-client');

exports =
module.exports = job;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    alias('p', 'program-file').
    demand('program-file').
    alias('d', 'data-file').
    demand('data-file').
    alias('b', 'bid');
    // demand('bid'); // FIXME: Don't need bids for now
};

function job(args, credential) {
  if (! fs.existsSync(args.p))
    error('program file not found: ' + args.p);

  var program = fs.readFileSync(args.p, 'utf8');

  if (! fs.existsSync(args.d))
    error('data file not found: ' + args.d);

  var options = {
    // FIXME: Don't need bids for now
    bid: args.bid || 1,
    dataFilePath: args.d,
    program: program,
    credential: credential
  };

  console.log('About to create a task with these options:\n%s'.yellow, inspect(
    args.debug
    ? options
    : { dataFile: args.d, programFile: args.p }).green);

  read({
    prompt: 'Confirm? [y,n]',
    default: 'y'
  }, function(err, answer) {
    if (answer.toLowerCase() == 'y')
      proceed(options);
  });


};

function proceed(options) {
  var jobClient = JobClient({
    credential: options.credential
  });

  jobClient.jobs.create({
    bid: options.bid,
    program: options.program
  }, afterJobCreated);

  function afterJobCreated(err, job) {
    if (err) throw err;

    var stream = JobProducerClient({
      credential: options.credential,
      jobId: job._id
    });

    stream.on('error', error);

    var readFile = fs.createReadStream(options.dataFilePath, 'utf8');
    var jsonStream = JSONStream.parse([true]);
    readFile.pipe(jsonStream).pipe(stream, {end: false});

    var sent = 0;
    var acknowledged = 0;
    var multi = multimeter(process);
    var bar = multi.rel(0, -1);

    var finishedSending = false;
    jsonStream.once('end', function() {
      finishedSending = true;
      updateBar();
    });

    jsonStream.on('data', function() {
      sent ++;
      updateBar();
    });

    stream.on('acknowledge', function() {
      acknowledged ++;
      updateBar();
    });

    function updateBar() {
      var percent = Math.round((acknowledged / sent) * 100);
      bar.percent(percent);
      if (finishedSending && sent == acknowledged) {
        multi.destroy();
        console.log('Upload terminated. Waiting for results... Hit Control-C if you wish to quit.');
      }
    }
  }
};

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
  process.exit(-1);
}