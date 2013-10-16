require('colors');

var TaskClient = require('crp-task-client');
var error = require('../error');


exports =
module.exports = del;
module.exports.requiresAuth = true;
module.exports.usage =
function usage(name, args) {
  args.
    alias('a', 'all');
};

function del(args, credential) {
  var taskId = args._[0];
  if (! taskId && !args.all) {
    error('No task id specified');
  }

  var client = TaskClient({
    credential: credential
  });

  if (! args.all)
    client.tasks.delete(taskId, function(err) {
      if (err) throw err;

      console.log('Task %s is scheduled for removal'.green, taskId);
    });
  else
    client.tasks.deleteAll(function(err) {
      if (err) throw err;
      console.log('All tasks are scheduled for removal'.green);
    });
}

