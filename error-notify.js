var auth = require('./auth');

/// Config

var apiKey = "a27c9e207b9541822262cb77dfc7fac1";
var bugsnag = require('bugsnag');

var bugsnagOptions = {
  appVersion: require('./package.json').version,
  projectRoot: __dirname,
  autoNotifyUncaught: false,
  useSSL: false
};

var context = 'crowdprocess-cli';

bugsnag.register(apiKey, bugsnagOptions);

process.on('uncaughtException', function(err) {
  console.error(err.stack || err);
  var meta = {};

  var token = auth.getToken();
  if (token) meta.user = token.user;

  notify(err, context, meta, function(err) {
    if (err) console.error(err.stack || err);
    process.exit(1);
  });
})

var notify =
exports =
module.exports =
function notify(err, context, meta, callback) {
  if (arguments.length < 4 && typeof meta == 'function') {
    callback = meta;
    meta = undefined;
  }
  if (! meta) meta = {};
  meta.context = context;

  if (! callback) callback =
  function(err, response) {
    if (err)
      console.error('Error notifying bugsnag of error: %s. Response: %j',
        err.stack || err, response);
  };

  bugsnag.notify(err, meta, callback);
};