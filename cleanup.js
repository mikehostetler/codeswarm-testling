module.exports = cleanup;

function cleanup(build, stage, config, context) {
  var tunnel = context.testling && context.testling.tunnel;
  if (tunnel) tunnel.stop(replied);
  else stage.end();

  function replied(err) {
    if (err) stage.error(err);
    stage.end();
  }
}