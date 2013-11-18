require('colors');
var async = require('async');
var moment = require('moment');
var JobClient = require('crp-job-client');
var error = require('../error');

exports =
module.exports = list;

module.exports.requiresAuth = true;

function list(args, credential) {
  var jobClient = JobClient({
    credential: credential
  });

  jobClient.list(function(err, jobs) {
    if (err) throw err;
    var percentage = 0;

    if (jobs.length) {
      console.log('created at\t\tstate\t\ttotal\t\terrors\t\tcomplete\tpending\t\tID');
    }

    jobs.sort(sortJob);
    async.eachSeries(jobs, show);

    function show(job, done) {
      var state = job.state || 'active';
      jobClient(job.id).view(function(err, progress) {
        if (err) error(err);

        var createdAt = job.created;
        if (createdAt) createdAt = moment(createdAt)
        if (createdAt) createdAt = createdAt.format('hh:mm YY-MM-DD');
        var color = 'yellow';
        var complete = progress.total == progress.complete;
        if (complete) {
          if (state == 'active') state = 'complete';
          if (! progress.errors && state != 'canceled') color = 'green';
          else color = 'red';
        }
        console.log('%s\t\t%s\t\t%s\t\t%s\t\t%s\t\t%s\t\t%s'[color],
          createdAt,
          state,
          number(progress.total),
          number(progress.errors),
          number(progress.complete),
          number(progress.pending),
          job.id);
        done();

      });
    }

  });

}

function prop(p) {
  return function(o) {
    return o[p];
  };
}

function sortJob(b, a) {
  return (a.created_at || 0) - (b.created_at || 0);
}

function number(n) {
  var s = n;
  if (isNaN(n)) s = '?';
  return s;
}
