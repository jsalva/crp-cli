var utils = require('./utils');
var fs = require('fs');

exports.getToken =
function getToken() {
  var tokenPath = utils.getUserHome() + '/.crowdprocess/auth_token.json';
  if (fs.existsSync(tokenPath)) {
    var token = fs.readFileSync(tokenPath, {encoding: 'utf8'});
    token = JSON.parse(token);
  }
  return token;
}