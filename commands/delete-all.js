require('colors');
var async = require('async');
var moment = require('moment');
var Client = require('crp-job-client');

exports =
module.exports = deleteAll;

module.exports.requiresAuth = true;

function deleteAll(args, credential) {
  var client = Client({
    credential: credential
  });

  client.jobs.list(function(err, jobs) {
    if (err) throw err;
    var percentage = 0;

    jobs.sort(sortTask);
    async.eachSeries(jobs, show);

    function show(task, done) {
      var state = task.state || 'active';
      var taskId = task._id;
      client.jobs.delete(taskId, function(err) {
        if (err) throw err;

        console.log('deleted task ', taskId);
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