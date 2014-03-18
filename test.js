var async         = require('async');
var request       = require('request');
var resultParsers = require('./result_parsers');


module.exports = test;

function test(build, stage, config, context) {

  stage.fakeCommand('starting tests in Testling');

  if (! config.files) return stage.error(new Error('Need config.files'));

  var tunnel = context.testling && context.testling.tunnel;
  if (! tunnel) return stage.error(new Error('No tunnel is set up'));

  var tunneledUrlBase = context.tunnel_url;
  if (! tunneledUrlBase) return stage.error(new Error('Need context.tunnel_url'));

  var framework = config.framework;
  if (! framework) return stage.error(new Error('Need config.framework'));

  var browsers = config.browsers;
  if (! browsers) return stage.error(new Error('Need config.browsers'));
  if (! Array.isArray(browsers)) browsers = [browsers];

  var urls = config.files.split('\n').map(trim).map(fileToURL);

  console.log('URLS:', urls);

  async.map(urls, testOneUrl, done);

  function testOneUrl(targetURL, cb) {

    if (! targetURL) return cb(new Error('No URL'));

    async.map(browsers, testOneUrlOneBrowser, cb);

    function testOneUrlOneBrowser(browser, cb) {

      var url = 'https://testling.com/visit?uri=' +
                encodeURIComponent(targetURL) +
                '&browser=' +
                encodeURIComponent(browser);

      console.log('[testling] visiting url %j on browser %j', url, browser);

      var browserStream = request({
        auth: {
          user: config.testling_username,
          pass: config.testling_password
        },
        method: 'GET',
        url: url,
        rejectUnauthorized: false
      });

      var reply = '';
      browserStream.on('data', onBrowserData);

      function onBrowserData(d) {
        console.log('from browser: %j', d);
        reply += d;
      }

    }
  }


  /// Test ended

  function done(err, results) {
    if (err) stage.error(err);

    console.log('ALL DONE:', results);

    var failed = false;

    results = parseResults(results);

    if (results.errors.length)
      stage.error(new Error(results.errors.join('\n')));

    stage.end({browsers: results.results});
  }

  function parseResults(results) {
    var url, urlResult, browser, browserResult;
    var finalResults = {}, errors = [];
    for(var urlIndex = 0 ; urlIndex < urls.length; urlIndex ++) {
      url = urls[urlIndex];
      urlResult = results[urlIndex];
      finalResults[url] = {};
      for(var browserIndex = 0 ; browserIndex < browsers.length;  browserIndex ++) {
        browser = browsers[browserIndex];
        browserResult = urlResult[browserIndex];
        finalResults[url][browser] = browserResult;

        if (browserResult && browserResult.results && browserResult.results.failed) {
          errors.push(
            'Tests on browser ' + browser +
            ' had ' + browserResult.results.failed + ' failures: ' +
            (browserResult.errors || ['unknown']).join('\n'));

        }
      }
    }

    return {
      errors: errors,
      results: finalResults
    };
  }


  /// Misc

  function fileToURL(file) {
    if (file.charAt(0) != '/') file = '/' + file;
    return tunneledUrlBase + file;
  }

};

/// Misc

function trim(s) {
  return s.trim();
}