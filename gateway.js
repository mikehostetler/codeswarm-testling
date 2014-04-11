exports.start = startGateway;

var ports = require('./gateway_ports');

function startGateway(stage, config, context, cb) {
  var types = config.types || [];
  if (!Array.isArray(types)) types = [types];

  var args = [];
  types.forEach(function(type) {
    args.push('--type', type);
  });

  args.push('--docroot', '.');

  args.push('--ports', ports.join(','));

  args.push('--post-results-url', 'http://testling.com/visit/' + context.testling.tunnel.id);

  var files = config.files;
  if (! Array.isArray(files)) files = [files];
  files.forEach(function(file) {
    args.push('--inject', file + ':' + config.framework);
  });

  var gateway = stage.command('codeswarm-gateway', args, { background: true });
  gateway.once('close', onGatewayClose);
  gateway.stdout.setEncoding('utf8');
  gateway.stdout.on('data', onGatewayData);
  gateway.stderr.setEncoding('utf8');
  gateway.stderr.on('data', onGatewayData);


  var success = false;
  var out = '';
  function onGatewayData(d) {
    console.log('[GATEWAY] %s'.yellow, d);
    if (! success) {
      out += d;
      detectSuccess();
    }
  }

  function detectSuccess() {
    var match = out.match(/listening on port ([0-9]+)/);
    if (match) {
      success = true;
      context.port = match[1].trim();
      cb();
    }
  }

  function onGatewayClose(code) {
    console.log('[GATEWAY] closed with code ' + code);
  }
}