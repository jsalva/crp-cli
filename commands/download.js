require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var JSONStream = require('JSONStream');
var multimeter = require('multimeter');

var JobClient = require('job-client');

exports =
module.exports = download;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    usage('Usage: crowdprocess-cli' + ' ' + name + ' <job_id> -c <client_id> -O <out.json> --wait').
    alias('O', 'output-file').
    demand('output-file').
    boolean('w').
    alias('w', 'wait');
};

function download(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No job id specified');
    process.exit(-1);
  }

  var out = fs.createWriteStream(args.O);

  var client = JobClient({credential: credential});

  client.jobs.progress(jobId, function(err, stats) {
    if (err) throw err;

    console.error('This job has %d data units', stats.total);
    var complete = stats.complete;
    if (! complete) {
      console.error('0 results — quitting.'.red);
      process.exit(-1);
    }

    console.log('Downloading %d results...'.green, complete);

    var multi = multimeter(process);
    var bar = multi.rel(0, -1);

    var encoder = JSONStream.stringify();
    var s = client.jobs(jobId).results.getAll(args.wait);
    s.pipe(encoder).pipe(out);

    var arrived = 0;
    s.on('data', function(d) {
      arrived ++;
      if (arrived <= complete) updateBar();
    });

    encoder.once('end', function() {
      finishedSending = true;
    });

    encoder.on('data', function() {
      arrived ++;
      updateBar();
    });

    function updateBar() {
      bar.percent((arrived / complete) * 100);
      if (arrived == complete) {
        multi.destroy();
        if (args.wait) {
          console.log('All results arrived, now waiting for new...');
        }
      }
    }

  });
};