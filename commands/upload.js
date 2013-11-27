require('colors');
var assert      = require('assert');
var fs          = require('fs');
var inspect     = require('util').inspect;

var read        = require('read');
var JSONStream  = require('JSONStream');
var Stringifier = require('newline-json').Stringifier;
var multimeter  = require('multimeter');
var SpeedMeter  = require('speed-meter');

var StreamClient = require('crp-stream-client')
var TaskClient = require('crp-task-client');

exports =
module.exports = upload;

module.exports.requiresAuth = true;

module.exports.usage = usage;
function usage(name, args) {
  args.
    usage('Usage: crowdprocess' + ' ' + name + ' <task_id> [-t <results.json>]').
    alias('t', 'tasks-file').
    alias('d', 'data-file (legacy, same as -t)');
}

var tasksSize;
var speedMeter;
var upstream;
var multi = multimeter(process.stderr);
var bar = multi.rel(0, -1);
function upload(args, token) {
  var jobId = args._[0];;
  var tasksFilePath = args.t || args.d; // args.d for legacy

  if (tasksFilePath && !fs.existsSync(tasksFilePath)) {
    console.error('tasks file not found: ' + tasksFilePath);
    process.exit(1);
  }

  if (tasksFilePath)
    tasksSize = fs.statSync(tasksFilePath).size;


  var tasks = StreamClient.TaskStream({
    jobId: jobId,
    token: token
  });

  tasks.on('error', error);
  tasks.on('fault', error);

  if (tasksFilePath)
    upstream = fs.createReadStream(tasksFilePath, {
      highWaterMark: '10240',
      encoding: 'utf8'
    });
  else
    upstream = process.stdin;


  upstream.on('data', trackProgress);
  upstream.on('error', error);
  var jsonParse = JSONStream.parse('*');
  var stringifier = new Stringifier();

  upstream.pipe(jsonParse).pipe(stringifier).pipe(tasks);

  speedMeter = SpeedMeter(upstream);

  tasks.on('end', function () {
    updateBar(tasksSize);
  });
};

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
}

function trackProgress (data) {
  updateBar(data.length);
}

function updateBar(uploaded) {
  if (!tasksSize)
    tasksSize = uploaded;
  var percent = Math.floor((uploaded / tasksSize) * 100);
  var message = 'uploaded: ' + percent + ' %'
  message += ' - (' + speedMeter.speed + ' bytes/sec)';
  bar.percent(percent, message);
  if (percent === 100) {
    multi.destroy();

    setTimeout(function() {
      process.exit(0);
    }, 2000).unref();
  }
}
