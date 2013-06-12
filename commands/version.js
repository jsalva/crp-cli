var pkg = require('../package.json');

exports =
module.exports = function () {
  console.log(pkg.name, pkg.version);
};

module.exports.requiresAuth = false;