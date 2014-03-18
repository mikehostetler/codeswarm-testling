var async   = require('async');
var gateway = require('./gateway');
var Tunnel  = require('./tunnel');

module.exports = env;

function env(build, stage, config, context) {

  async.series([
    startGateway,
    startTunnel
    ], done);

  function startGateway(cb) {
    gateway.start(stage, config, cb);
  }

  function startTunnel(cb) {
    context.testling = {};
    context.testling.tunnel =
      new Tunnel(build, stage, config, context);

    context.testling.tunnel.start(cb);
  }

  function done(err) {
    if (err) stage.error(err);
    else console.log('[testling] gateway and tunnel started'.green, err);
    stage.end();
  }
}