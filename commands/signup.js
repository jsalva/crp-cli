require('colors');
var read = require('read');
var adminClient = require('crp-admin-client')();
var login = require('./login');
var error = require('../error');

module.exports = signup;

module.exports.usage =
function usage(name, args) {
  args.
    alias('invitation', 'i').
    demand('invitation').
    usage('crowdprocess signup -i <invitation> [<email>] [<password>]');
};

function signup(args) {
  username(function(username) {
    if (! username) error('Needs user name');
    password(function(password) {
      if (! password) error('Needs password');

      doSignup(username, password, args.invitation, function(err) {
        if (err) error(err);
        console.log('Signed up successfully'.green);
        login({_: [ username, password ]});
      });
    });
  });

  function username(cb) {
    var username = args._[0];
    if (username) return cb(username);

    read({
      prompt: 'Email:'
    }, function(err, username) {
      cb(username);
    });
  }

  function password(cb) {
    var password = args._[1];
    if (password) return cb(password);

    read({
      prompt: 'Password:',
      silent: true
    }, function(err, password) {
      cb(password);
    });
  }
}

function doSignup(username, password, invitation, cb) {
  adminClient.account.create(username, password, invitation, cb);
}