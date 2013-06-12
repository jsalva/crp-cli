require('colors');
var fs         = require('fs');
var JSONStream = require('JSONStream');

var JobClient = require('crp-job-client');
var JobProducerClient = require('crp-job-producer-client');

exports =
module.exports = io;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    usage('cat data.json | crowdprocess io -p program.json > results.json').
    alias('p', 'program-file').
    demand('program-file').
    alias('b', 'bid');
    // demand('bid'); // FIXME: Don't need bids for now
};

var producerStream;
var clientStream;

var sent;
var acknowledged;
var arrived;

function io(args, credential) {
  if (! fs.existsSync(args.p))
    error('program file not found: ' + args.p);

  var program = fs.readFileSync(args.p, 'utf8');
  var bid = args.bid || 1; // FIXME: Don't need bids for now

  var jobClient = JobClient({
    credential: credential
  });

  jobClient.jobs.create({
    bid: bid,
    program: program
  }, afterJobCreated);

  function afterJobCreated(err, job) {
    if (err) throw err;

    var jobId = job._id;

    producerStream = JobProducerClient({
      credential: credential,
      jobId: jobId
    });

    producerStream.on('error', error);

    var dataStream = process.stdin;
    var jsonParser = JSONStream.parse([true]);
    dataStream.pipe(jsonParser).pipe(producerStream, {end: false});

    getResults(jobId);

    var sent = 0;
    var acknowledged = 0;

    var finishedSending = false;
    jsonParser.once('end', function() {
      finishedSending = true;
    });

    jsonParser.on('data', function() {
      sent ++;
    });

    producerStream.on('acknowledge', function() {
      acknowledged ++;
    });

    producerStream.once('end', function() {
      if (! finishedSending || sent != acknowledged) {
        console.error('Producer stream ended prematurely.'.red);
        console.error('Only acknowledged %d of the %d sent.', acknowledged, sent);
      }
    });
  }

  function getResults(jobId) {
    var encoder = JSONStream.stringify();
    clientStream = jobClient.jobs(jobId).results.getAll(true);
    clientStream.pipe(encoder).pipe(process.stdout);

    clientStream.on('data', function () {
      arrived ++;
    });

    clientStream.on('end', function () {
      if (arrived != acknowledged) {
        console.error('Result stream ended prematurely.'.red);
        console.error('Only got back %d of the %d acknowledged.', arrived, acknowledged);
      }
    });
  }
}

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
  process.exit(-1);
}

process.on('SIGINT', function() {
  if (clientStream)
    clientStream.destroy();
  if (producerStream)
    producerStream.end();
});