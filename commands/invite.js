require('colors');
var read = require('read');
var AdminClient = require('crp-admin-client');
var error = require('../error');

module.exports = invite;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    usage('crowdprocess ' + name);
};


function invite(args, credential) {
  var adminClient = AdminClient({credential: credential});
  adminClient.invitations.create(function(err, invitation) {
    if (err) error(err);

    console.error('Invitation code: %s', invitation.green);
  });
};