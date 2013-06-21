require('colors');
var fs         = require('fs');
var JSONStream = require('JSONStream');
var multimeter = require('multimeter');

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

var sent = 0;
var acknowledged = 0;
var arrived = 0;
var multi = multimeter(process.stderr);
multi.charm.reset();
var finishedSending;

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

  function afterJobCreated(err, task) {
    if (err) throw err;

    var taskId = task._id;

    multi.write('Created task '+taskId+'\n\n');

    multi.write('sent:    \n');
    var sentBar = multi(12, 3, {
      width: 60
    });

    producerStream = JobProducerClient({
      credential: credential,
      jobId: taskId
    });

    producerStream.on('error', logError);

    var dataStream = process.stdin;
    var jsonParser = JSONStream.parse([true]);
    dataStream
      .pipe(jsonParser)
      .pipe(producerStream, {end: false});

    getResults(taskId);

    finishedSending = false;
    jsonParser.once('end', function() {
      finishedSending = true;
    });

    jsonParser.on('data', function() {
      sent ++;
      updateSentBar();
    });

    producerStream.on('acknowledge', function() {
      acknowledged ++;
      updateSentBar();
    });

    producerStream.once('end', exit);

    function updateSentBar () {
      var percent = Math.round((acknowledged / sent) * 100);
      sentBar.percent(percent);
    }
  }

  function getResults(taskId) {
    var encoder = JSONStream.stringify();
    clientStream = jobClient.jobs(taskId).results.getAll(true);
    clientStream.pipe(encoder).pipe(process.stdout);

    multi.write('arrived: \n');
    var arrivedBar = multi(12, 4, {
      width: 60
    });

    clientStream.on('data', function () {
      arrived ++;
      updateArrivedBar();
    });

    clientStream.on('end', exit);

    function updateArrivedBar() {
      var percent = Math.round((arrived / acknowledged) * 100);
      arrivedBar.percent(percent);
      if (finishedSending && sent == acknowledged) {
        multi.write('\nAll done.\n');
        multi.destroy();
        stream.end();
      }
    }
  }
}

function logError(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error('\n', err);
}

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error('\n', err);
  process.exit(-1);
}

function exit() {
  console.log('\n');
  if (! finishedSending || sent !== acknowledged) {
    multi.write('Producer stream ended prematurely.\n');
    multi.write('Only acknowledged '+acknowledged+' of the '+sent+' sent.\n');
  }
  if (arrived !== acknowledged) {
    multi.write('Result stream ended prematurely.\n');
    multi.write('Only got back '+arrived+' of the '+acknowledged+' acknowledged.\n');
  }

  if (finishedSending && arrived === acknowledged)
    multi.write('\nAll done.\n');

  multi.destroy();
  console.log('Closing streams... about to exit...');
  if (clientStream)
    clientStream.destroy();
  if (producerStream)
    producerStream.end();
}

multi.on('^C', exit);
process.on('SIGINT', exit);