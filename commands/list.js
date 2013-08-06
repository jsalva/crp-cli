require('colors');
var async = require('async');
var moment = require('moment');
var Client = require('crp-job-client');
var error = require('../error');

exports =
module.exports = list;

module.exports.requiresAuth = true;

function list(args, credential) {
  var client = Client({
    credential: credential
  });

  client.tasks.list(function(err, tasks) {
    if (err) throw err;
    var percentage = 0;

    if (tasks.length) {
      console.log('created at\t\tstate\t\ttotal\t\terrors\t\tcomplete\tpending\t\tID');
    }

    tasks.sort(sortTask);
    async.eachSeries(tasks, show);

    function show(task, done) {
      var state = task.state || 'active';
      client.tasks.progress(task._id, function(err, progress) {
        if (err) error(err);

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
        console.log('%s\t\t%s\t\t%s\t\t%s\t\t%s\t\t%s\t\t%s'[color],
          createdAt,
          state,
          number(progress.total),
          number(progress.errors),
          number(progress.complete),
          number(progress.pending),
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

function number(n) {
  var s = n;
  if (isNaN(n)) s = '?';
  return s;
}