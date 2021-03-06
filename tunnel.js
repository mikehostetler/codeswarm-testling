var inherits     = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var request      = require('request');
var shelly       = require('shelly');
var uuid         = require('node-uuid').v4;


var SSH_TUNNEL_TIMEOUT_MS = 30 * 1000; // 30 seconds

var tunnelSetupRegex = /ssh .+\r\n/;
var sshArgsRegex = /ssh -(.*) (.+):localhost:(.+) (.+)@(.+)/
var tunnelURLRegex = /http\:\/\/tunnel.browserling.com\:.+\r/;


module.exports = Tunnel;

function Tunnel(build, stage, config, context) {
  EventEmitter.call(this);

  this.id = uuid();

  this.build = build._id || build.id;

  this.stage = stage;
  this.config = config;
  this.context = context;

  this.base = 'https://testling.com';
}

inherits(Tunnel, EventEmitter);

Tunnel.prototype.openRemoteTunnel = function(callback) {
  var self = this;

  var auth = {
    user: this.config.testling_username,
    pass: this.config.testling_password
  };

  request.post({
    auth: auth,
    method: 'GET',
    rejectUnauthorized: false,
    url: this.base + '/tunnel/open/' + self.id
  }, openTunnelReplied);

  function openTunnelReplied(err, res, body) {
    if (err) return callback(err);

    if (res.statusCode != 200)
      return callback(
        new Error('Response status code was ' + res.statusCode +
                  '. body: ' + JSON.stringify(body)));

    /// get SSH command from response
    var match = body.match(tunnelSetupRegex);
    if (! match)
      return callback(
        new Error(
          'Error reply from testling trying to open tunnel: ' +
          JSON.stringify(body)));
    var command = match[0].trim();

    self.context.ssh_command = command;


    /// get tunnel URL from response

    match = body.match(tunnelURLRegex);
    if (! match)
      return callback(
        new Error(
          'Error reply from testling trying to open tunnel: ' +
          JSON.stringify(body)));
    var url = match[0].trim();
    self.context.tunnel_url = url
    callback();
  }
};

Tunnel.prototype.placeSshKey = function placeSshKey(callback) {
  this.context.pkey_path = '/tmp/pkey-' + this.build;
  var outputSshKeyCommand =
    shelly('echo ? > ?', this.config.testling_private_key, this.context.pkey_path);

  var options = { silent: true};
  this.stage.command('bash', ['-c', outputSshKeyCommand], options).
    once('close', detectExitCodeAndCallback(callback));
};

Tunnel.prototype.chmodSshKey = function chmodSshKey(callback) {
  var options = { silent: true};
  this.stage.command('chmod', ['0600', this.context.pkey_path], options).
    once('close', detectExitCodeAndCallback(callback));
};

Tunnel.prototype.removeSshKey = function placeSshKey(callback) {
  var options = { cwd: '', silent: true};
  this.stage.command('rm', ['-rf', this.context.pkey_path], options).
    once('close', detectExitCodeAndCallback(callback));
};

Tunnel.prototype.openLocalTunnel = function sshTunnel(cb) {
  var command = this.context.ssh_command;
  console.log('[Testling] SSH COMMAND:', command);
  var parts = command.match(sshArgsRegex);

  var flags = '-' + parts[1];
  var remotePort = parts[2];
  var localPort = parts[3];
  var username = parts[4];
  var hostname = parts[5];

  console.log('CONTEXT port: %j'.red, this.context.port);

  var args = [
    '-v', // verbose
    '-i', this.context.pkey_path, // force using identity file
    '-o', 'PasswordAuthentication=no',
    '-o', 'StrictHostKeyChecking=no',
    flags,
    '*:' + remotePort + ':localhost:' + this.context.port,
    username + '@' + hostname];

  var options = {
    silent: true,
    background: true
  };

  var child = this.stage.command('ssh', args, options);

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', onLocalTunnelData);
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', onLocalTunnelData);

  child.once('close', onLocalTunnelClose);

  var timeout = setTimeout(timedout, SSH_TUNNEL_TIMEOUT_MS);

  var tunnelOutput = ''
  function onLocalTunnelData(d) {
    process.stdout.write('[testling tunnel ssh] ' + d);
    tunnelOutput += d;
    detectSuccess();
  }

  var success = false;
  function detectSuccess() {
    if (! success && tunnelOutput.indexOf('remote forward success') >= 0) {
      success = true;
      console.log('[testling] tunnel is open');
      callback();
    }
  }

  function timedout() {
    var message =
      'opening SSH tunnel to Testling timed out after ' +
      (SSH_TUNNEL_TIMEOUT_MS / 1000) + ' seconds';

    callback(new Error(message));
  }

  var calledback = false;
  function callback(err) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (! calledback) {
      calledback = true;
      cb(err);
    }
  }

  function onLocalTunnelClose(code) {
    console.log('[testling] local tunnel closed with status ' + code);
  }
};

Tunnel.prototype.startRemote = function(callback) {
  this.openRemoteTunnel(callback);
};

Tunnel.prototype.startLocal = function(callback) {
  this.emit('verbose:writeln', "=> Testling trying to open tunnel".inverse);

  async.series([
    this.placeSshKey.bind(this),
    this.chmodSshKey.bind(this),
    this.openLocalTunnel.bind(this),
    this.removeSshKey.bind(this)
    ], callback);
};


Tunnel.prototype.stop = function stop(cb) {
  var auth = {
    user: this.config.testling_username,
    pass: this.config.testling_password
  };

  request({
    auth: auth,
    method: 'GET',
    url: this.base + '/tunnel/close/' + this.id,
    rejectUnauthorized: false
  }, replied);

  function replied(err, res, body) {
    if (cb) return cb(err);
    if (res.statusCode != 200)
      return cb(
        new Error('Error closing tunnel: status code was ' + res.statusCode +
                 ', body: ' + JSON.stringify(body)));
  }
}

/// Misc

function trim(s) {
  return s.trim();
}

function detectExitCodeAndCallback(cb) {
  return function(code) {
    var err;
    if (code != 0) err = new Error('Exit code was ' + code);
    cb(err);
  }
}

function timeout(ms) {
  return function(cb) {
    setTimeout(cb, ms);
  };
}