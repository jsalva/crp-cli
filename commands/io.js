require('colors');
var fs         = require('fs');
var JSONStream = require('JSONStream');
var multimeter = require('multimeter');
var SpeedMeter  = require('speed-meter');

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

  jobClient.tasks.create({
    bid: bid,
    program: program
  }, afterTaskCreated);

  function afterTaskCreated(err, task) {
    if (err) throw err;

    var taskId = task._id;

    multi.write('Created task '+taskId+'\n\n');

    multi.write('sent:    \n');
    var sentBar = multi(12, 3, {
      width: 40
    });

    producerStream = JobProducerClient({
      credential: credential,
      taskId: taskId
    });

    producerStream.on('error', logError);

    var dataStream = process.stdin;
    dataStream.setEncoding('utf8');

    var jsonParser = JSONStream.parse([true]);

    dataStream
      .pipe(jsonParser)
      .pipe(producerStream, {end: false});

    getResults(producerStream);

    finishedSending = false;
    jsonParser.once('end', function() {
      finishedSending = true;
    });

    jsonParser.on('data', function(d) {
      sent ++;
      updateSentBar();
    });

    producerStream.on('acknowledge', function() {
      acknowledged ++;
      updateSentBar();
      checkFinished();
    });

    producerStream.once('end', exit);

    process.on('SIGINT', end);

    // Speed meter

    var sendSpeedMeter = SpeedMeter(jsonParser);

    function updateSentBar () {
      var percent = Math.floor((acknowledged / sent) * 100);
      var message = 'sent: ' + sent + ', acknowledged: ' + acknowledged +
                    ' (' + percent + '%)';
      message += ' - (' + sendSpeedMeter.speed + ' bytes/sec)';
      message += '      '; // padding
      sentBar.percent(percent, message);
    }
  }

  function getResults(producerStream) {
    var encoder = JSONStream.stringify();
    encoder.pipe(process.stdout);

    multi.write('arrived: \n');
    var arrivedBar = multi(12, 4, {
      width: 40
    });

    producerStream.on('result', function (res) {
      arrived ++;
      encoder.write(res);
      updateArrivedBar();
      checkFinished();
    });

    producerStream.on('end', function() {
      encoder.end();
    });

    function updateArrivedBar() {
      var percent = Math.round((arrived / acknowledged) * 100);
      var message = 'results: ' + arrived + ' (' + percent + '%)';
      message += '      '; // padding
      arrivedBar.percent(percent, message);
    }
  }

  function checkFinished() {
    if (finishedSending && sent == acknowledged && acknowledged == arrived) {
      multi.write('\nAll done.\n');
      multi.destroy();
      console.error('Sent: %d, Acknowledged: %d, Arrived: %d',
        sent, acknowledged, arrived);
      end();
    }
  }

  function end() {
    producerStream.end();
  }

}

function logError(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error('\n', err);
}

function error(err) {
  logError(err);
  process.exit(-1);
}

function exit() {
  multi.write('\n\n');
  if (! finishedSending || sent !== acknowledged) {
    multi.write('Producer stream ended prematurely.\n');
    multi.write('Only acknowledged '+acknowledged+' of the '+sent+' sent.\n');
  }
  if (arrived !== acknowledged) {
    multi.write('Result stream ended prematurely.\n');
    multi.write('Only got back '+arrived+' of the '+acknowledged+' acknowledged.\n');
  }

  if (finishedSending && arrived === acknowledged)
    multi.write('\nAll done.');

  multi.write('\n');
  multi.destroy();
  if (clientStream)
    clientStream.destroy();
  if (producerStream)
    producerStream.end();
  process.exit();
}