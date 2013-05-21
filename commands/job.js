require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var read       = require('read');
var JSONStream = require('JSONStream');
var multimeter = require('multimeter')

var JobProducerClient = require('job-producer-client');

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
    alias('b', 'bid').
    demand('bid');
};

function job(args, credential) {
  if (! fs.existsSync(args.p))
    error('program file not found: ' + args.p);

  var program = fs.readFileSync(args.p, 'utf8');

  if (! fs.existsSync(args.d))
    error('data file not found: ' + args.d);

  var options = {
    bid: args.bid,
    dataFilePath: args.d,
    program: program,
    credential: credential
  };

  console.log('About to create job with these options:\n%s'.yellow, inspect(options).green);
  read({
    prompt: 'Confirm? [y,n]',
    default: 'y'
  }, function(err, answer) {
    if (answer.toLowerCase() == 'y')
      proceed(options);
  });


};

function proceed(options) {
  var client = JobProducerClient({
    credential: options.credential
  });

  client.on('error', error);

  var stream =
  client.createJob({
    bid: options.bid,
    program: options.program
  });

  client.once('job created', function(jobId) {
    console.log('Job successfully created with id %s', jobId);

    var sent = 0;
    var acknowledged = 0;
    var multi = multimeter(process);
    var bar = multi.rel(0, -1);
    var readFile = fs.createReadStream(options.dataFilePath, 'utf8');
    var jsonStream = JSONStream.parse([true]);
    readFile.pipe(jsonStream).pipe(stream, {end: false});
    stream.start();

    var finishedSending = false;
    jsonStream.once('end', function() {
      finishedSending = true;
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
      bar.percent((acknowledged / sent) * 100);
      if (finishedSending && sent == acknowledged) {
        multi.destroy();
        console.log('Upload terminated. Waiting for results... Hit Control-C if you wish to quit.');
      }

    }

  });

};

function error(err) {
  if (typeof err != 'string')
    err = err.message;

  console.error(err);
  process.exit(-1);
}