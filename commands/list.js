require('colors');
var async = require('async');
var moment = require('moment');
var Client = require('job-client');

exports =
module.exports = list;

module.exports.requiresAuth = true;

function list(args, credential) {
  var client = Client({
    credential: credential
  });

  client.jobs.list(function(err, jobs) {
    if (err) throw err;
    var percentage = 0;

    if (jobs.length) {
      console.log('created at\t\tbid\t\ttotal\t\tcomplete\tpending\t\tID');
    }

    jobs.sort(sortJob);
    async.map(jobs.map(prop('_id')), client.jobs.progress, function(err, progresses) {
      if (err) return console.error(err);

      jobs.forEach(show);

      function show(job, i) {
        var createdAt = job.created_at;
        if (createdAt) createdAt = moment(createdAt)
        if (createdAt) createdAt = createdAt.format('YYYY-MM-DD');
        var progress = progresses[i];
        var color = 'yellow';
        var complete = progress.total == progress.complete;
        if (complete) color = 'green';
        console.log('%s\t\t%s\t\t%d\t\t%d\t\t%d\t\t%s'[color],
          createdAt,
          job.bid,
          progress.total,
          progress.complete,
          progress.pending,
          job._id);
      }
    });
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