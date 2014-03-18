var async = require('async');

module.exports = prepare;

function prepare(build, stage, config, context) {

  runBeforeScripts(done);

  function runBeforeScripts(cb) {
    if (config.before_script) {
      var scripts = config.before_script.split('\n').map(trim);
      async.eachSeries(scripts, runScript, cb);

    } else cb();

    function runScript(script, cb) {
      stage.command('bash', ['-c', script]).once('close', onCommandClose);

      function onCommandClose(code) {
        if (code != 0) cb(new Error('Exit code: ' + code));
        else cb();
      }
    }
  }

  function done(err) {
    if (err) stage.error(err);
    stage.end();
  }

}


/// Misc

function trim(s) {
  return s.trim();
}