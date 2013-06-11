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
      console.log('created at\t\tstate\t\ttotal\t\terrors\t\tcomplete\tpending\t\tID');
    }

    jobs.sort(sortTask);
    async.eachSeries(jobs, show);

    function show(task, done) {
      var state = task.state || 'active';
      client.jobs.progress(task._id, function(err, progress) {
        if (err) return console.error(err);

        var createdAt = task.created_at;
        if (createdAt) createdAt = moment(createdAt)
        if (createdAt) createdAt = createdAt.format('hh:mm YY-MM-DD');
        var color = 'yellow';
        var complete = progress.total == progress.complete;
        if (complete) {
          if (state == 'active') state = 'complete';
          if (! progress.errors && state != 'canceled') color = 'green';
          else color = 'red';
        }
        console.log('%s\t\t%s\t\t%d\t\t%s\t\t%d\t\t%d\t\t%s'[color],
          createdAt,
          state,
          progress.total,
          progress.errors,
          progress.complete,
          progress.pending,
          task._id);
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

function sortTask(b, a) {
  return (a.created_at || 0) - (b.created_at || 0);
}