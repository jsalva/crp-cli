require('colors');
var read = require('read');
var fs = require('fs');
var authClient = require('auth-client');
var utils = require('../utils');

exports =
module.exports = login;

module.exports.usage =
function usage(name, args) {
  args.
    usage('crowdprocess login <username> <password>');
};

function login(args) {

  username(function(username) {
    password(function(password) {
      doLogin(username, password, function(err) {
        if (err) {
          console.error(err.message.red);
          return;
        }
        console.log('Logged in'.green);
      });
    });
  })

  function username(cb) {
    var username = args._[0];
    if (username) return cb(username);

    read({
      prompt: 'Username:'
    }, function(err, username) {
      if (err) throw err;
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
      if (err) throw err;
      cb(password);
    });
  }
}

function doLogin(username, password, cb) {
  authClient.login(username, password, function(err, token) {
    if (err) return cb(err);
    writeToken(token);
    cb();
  });
}

var cpDir = utils.getUserHome() + '/.crowdprocess';
function writeToken(token) {
  token.expires_at = token.expires_in + Date.now();
  if (!fs.existsSync(cpDir)) {
    fs.mkdirSync(cpDir);
  }

  fs.writeFileSync(cpDir + '/auth_token.json', JSON.stringify(token));
}