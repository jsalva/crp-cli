require('colors');

var assert = require('assert');
var fs          = require('fs');
var inspect     = require('util').inspect;

var read        = require('read');
var JSONStream  = require('JSONStream');
var multimeter  = require('multimeter');
var SpeedMeter  = require('speed-meter');

var TaskClient = require('crp-task-client');
var TaskProducerClient = require('crp-task-producer-client');

exports =
module.exports = task;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    alias('p', 'program-file').
    demand('program-file').
    alias('d', 'data-file').
    demand('data-file').
    alias('b', 'bid').
    alias('y', 'confirm');
    // demand('bid'); // FIXME: Don't need bids for now
};

function task(args, credential) {
  if (! fs.existsSync(args.p)) {
    console.error('program file not found: ' + args.p);
    process.exit(1);
  }

  var program = fs.readFileSync(args.p, 'utf8');

  if (! fs.existsSync(args.d)) {
    console.error('data file not found: ' + args.d);
    process.exit(1);
  }


  var options = {
    // FIXME: Don't need bids for now
    bid: args.bid || 1,
    dataFilePath: args.d,
    program: program,
    credential: credential
  };

  if (args.y)
    return proceed(options);

  console.log('About to create a task with these options:\n%s'.yellow, inspect(
    args.debug
    ? options
    : { dataFile: args.d, programFile: args.p }).green);

  read({
    prompt: 'Confirm? [y,n]',
    default: 'y'
  }, function(err, answer) {
    if (answer && answer.toLowerCase() == 'y')
      proceed(options);
  });


};

function proceed(options) {
  var taskClient = TaskClient({
    credential: options.credential
  });

  taskClient.tasks.create({
    bid: options.bid,
    program: options.program
  }, afterTaskCreated);

  function afterTaskCreated(err, task) {
    if (err) throw err;

    assert('task', 'No task has been created.');

    console.log('Task successfully created.\nTask Id: ', task._id.yellow);
    console.log('Data units upload progress:');

    var stream = TaskProducerClient({
      credential: options.credential,
      taskId: task._id
    });

    stream.on('error', error);
    stream.on('fault', error);

    var readFile = fs.createReadStream(options.dataFilePath, {
      highWaterMark: '10240',
      encoding: 'utf8'
    });

    var jsonStream = JSONStream.parse([true]);

    readFile.
      pipe(jsonStream).
      pipe(stream, {end: false});

    var sent = 0;
    var acknowledged = 0;

    var multi = multimeter(process.stdout);
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

    var ended = false;

    stream.once('end', function() {
      ended = true;
      if (! finishedSending || sent != acknowledged) {
        console.error('Stream ended prematurely.'.red);
        console.error('Only acknowledged %d of the %d sent.', acknowledged, sent);
      } else {
        console.log('100%'.green);
        console.log('%d data units uploaded successfully'.green, sent);
        console.log('You can use `crowdprocess progress %s` to monitor task progress.', task._id);
      }
    });

    // Speed meter

    var speedMeter = SpeedMeter(jsonStream);

    function updateBar() {
      var percent = Math.floor((acknowledged / sent) * 100);
      var message = 'sent: ' + sent + ', acknowledged: ' + acknowledged +
                    ' (' + percent + '%)';
      message += ' - (' + speedMeter.speed + ' bytes/sec)';
      message += '      '; // padding
      bar.percent(percent, message);
      if (finishedSending && sent == acknowledged) {
        multi.destroy();
        stream.end();
        setTimeout(function() {
          if (! ended) process.exit(0);
        }, 2000).unref();

      }
    }
  }
};

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
}