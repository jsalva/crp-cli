var userHome = require('osenv').home;
var fs = require('fs');

exports.getToken =
function getToken() {
  var tokenPath = userHome() + '/.crowdprocess/auth_token.json';
  if (fs.existsSync(tokenPath)) {
    var token = fs.readFileSync(tokenPath, {encoding: 'utf8'});
    token = JSON.parse(token);
  }
  return token;
}
