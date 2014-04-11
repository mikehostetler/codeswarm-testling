var async   = require('async');
var gateway = require('./gateway');
var Tunnel  = require('./tunnel');

module.exports = env;

function env(build, stage, config, context) {

  context.testling = {};
  context.testling.tunnel =
    new Tunnel(build, stage, config, context);

  async.series([
    startRemoteTunnel,
    startGateway,
    startLocalTunnel,
    ], done);

  function startGateway(cb) {
    gateway.start(stage, config, context, cb);
  }

  function startRemoteTunnel(cb) {
    context.testling.tunnel.startRemote(cb);
  }

  function startLocalTunnel(cb) {
    context.testling.tunnel.startLocal(cb);
  }

  function done(err) {
    if (err) stage.error(err);
    else console.log('[testling] gateway and tunnel started'.green, err);
    stage.end();
  }
}