module.exports = {
  workerImage: 'browser',
  env:         require('./env'),
  prepare:     require('./prepare'),
  test:        require('./test'),
  cleanup:     require('./cleanup'),
  config:      require('./config')
};