require('colors');

var Client = require('job-client');

exports =
module.exports = progress;

module.exports.requiresAuth = true;

function progress(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No job id specified');
    process.exit(-1);
  }

  var client = Client({
    credential: credential
  });

  client.jobs.progress(jobId, function(err, stats) {
    if (err) throw err;
    var percentage = 0;
    if (stats.total) percentage = (stats.complete / stats.total) * 100;
    console.log('Progress for job %s:', jobId.yellow);
    console.log('\t%d%'.green, percentage);
    console.log('\tTotal   :\t%s', stats.total.toString().green);
    console.log('\tComplete:\t%s', stats.complete.toString().green);
    console.log('\tPending :\t%s', stats.pending.toString().green);
  });

}