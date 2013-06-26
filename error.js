module.exports =
function error(err) {
  if (err && err.status && err.status > 499) throw err;
  console.error(err.message || err.stack || err);
  process.exit(1);
};