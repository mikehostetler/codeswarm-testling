var browsers   = require('./browsers');
var frameworks = require('./frameworks');

module.exports = [
  {
    name: 'testling_username',
    label: 'Testling username',
    type: 'string',
    required: true
  },
  {
    name: 'testling_password',
    label: 'Testling password',
    type: 'password',
    required: true
  },
  {
    name: 'testling_private_key',
    label: 'Testling private key',
    type: 'text',
    required: true
  },
  {
    name: 'testling_public_key',
    label: 'Testling public key',
    type: 'text',
    required: true
  },
  {
    name: 'files',
    label: 'Test files (one per line)',
    type: 'text',
    required: true
  },
  {
    name: 'framework',
    label: 'Framework',
    type: 'selectOne',
    from: frameworks
  },
  {
    name: 'types',
    label: 'File types',
    type: 'selectMultiple',
    from: [
      'php'
    ]
  },
  {
    name: 'before_script',
    label: 'Before test scripts (one per line)',
    type: 'text'
  },
  {
    name: 'browsers',
    label: 'Browsers',
    type: 'selectMultiple',
    from: browsers
  }
];
