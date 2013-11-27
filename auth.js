var userHome = require('osenv').home;
var fs = require('fs');

exports.getToken =
function getToken() {
  var tokenPath = userHome() + '/.crowdprocess/auth_token';
  if (!fs.existsSync(tokenPath))
    return

  var token = fs.readFileSync(tokenPath, {encoding: 'utf8'});
  return token;
}
