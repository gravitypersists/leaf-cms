const Reflux = require('reflux')

let actions = Reflux.createActions({ 
  'login': {},
  'completeLogin': {},
  'logout': {},
  'createProfile': {},
  'updateProfile': {},
  'createBundle': {},
  'createLeaf': {},
  'addLeafToBundle': {},
  'addLeaf': {}
});

module.exports = actions;