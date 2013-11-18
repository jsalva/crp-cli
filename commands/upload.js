require('colors');
var assert      = require('assert');
var fs          = require('fs');
var inspect     = require('util').inspect;

var read        = require('read');
var JSONStream  = require('JSONStream');
var Stringifier = require('newline-json').Stringifier;
var multimeter  = require('multimeter');
var SpeedMeter  = require('speed-meter');

var TaskClient = require('crp-task-client');

exports =
module.exports = upload;

module.exports.requiresAuth = true;

module.exports.usage = usage;
function usage(name, args) {
  args.
    alias('j', 'jobid').
    demand('jobid').
    alias('t', 'tasks-file');
}

var tasksSize;
var speedMeter
var multi = multimeter(process.stderr);
var bar = multi.rel(0, -1);
function upload(args, credential) {
  var jobId = args.j;
  var tasksFilePath = args.t || args.d; // args.d for legacy

  if (tasksFilePath && !fs.existsSync(tasksFilePath)) {
    console.error('tasks file not found: ' + tasksFilePath);
    process.exit(1);
  }

  tasksSize = fs.statSync(tasksFilePath).size;

  var options = {
    tasksFilePath: tasksFilePath,
    credential: credential
  };

  var tasks = TaskClient(jobId, {
    credential: options.credential
  }).Tasks;

  tasks.on('error', error);
  tasks.on('fault', error);

  var readFile = fs.createReadStream(options.tasksFilePath, {
    highWaterMark: '10240',
    encoding: 'utf8'
  });

  readFile.on('data', trackProgress);
  var jsonParse = JSONStream.parse('*');
  var stringifier = new Stringifier();

  readFile.pipe(jsonParse).pipe(stringifier).pipe(tasks);



  stringifier.on('data', function (data) {
    console.log('got data in stringifier', data.toString())
  })

  speedMeter = SpeedMeter(readFile);

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
