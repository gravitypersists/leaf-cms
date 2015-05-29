const Reflux = require('reflux')

let actions = Reflux.createActions({ 
  'login': {},
  'completeLogin': {},
  'logout': {},
  'createProfile': {},
  'updateProfile': {},
  'createBundle': {},
  'createLeaf': {}
});

module.exports = actions;