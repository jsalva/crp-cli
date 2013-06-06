require('colors');
var async = require('async');
var moment = require('moment');
var Client = require('crp-job-client');

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
      console.log('created at\t\ttotal\t\tcomplete\tpending\t\tID');
    }

    jobs.sort(sortTask);
    async.map(jobs.map(prop('_id')), client.jobs.progress, function(err, progresses) {
      if (err) return console.error(err);

      jobs.forEach(show);

      function show(task, i) {
        var createdAt = task.created_at;
        if (createdAt) createdAt = moment(createdAt)
        if (createdAt) createdAt = createdAt.format('hh:mm YY-MM-DD');
        var progress = progresses[i];
        var color = 'yellow';
        var complete = progress.total == progress.complete;
        if (complete) color = 'green';
        console.log('%s\t\t%d\t\t%d\t\t%d\t\t%s'[color],
          createdAt,
          progress.total,
          progress.complete,
          progress.pending,
          task._id);
      }
    });
  });

}

function prop(p) {
  return function(o) {
    return o[p];
  };
}

function sortTask(b, a) {
  return (a.created_at || 0) - (b.created_at || 0);
}