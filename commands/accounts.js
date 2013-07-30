require('colors');
var Client = require('crp-admin-client');
var error = require('../error');

module.exports = accounts;
module.exports.requiresAuth = true;
module.exports.usage =
function usage(name, args) {
  args.usage('crowdprocess accounts');
};

function accounts(args, credential) {
  var client = Client({
    credential: credential
  });

  client.account.getAllEmails(cb);

  function cb(err, accounts) {
    if (err) return error(err);
    accounts.forEach(function(account) {
      console.log(account.green);
    });
  }
}
