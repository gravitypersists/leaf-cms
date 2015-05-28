const Reflux = require('reflux')

let actions = Reflux.createActions({ 
  'login': {},
  'completeLogin': {},
  'logout': {},
  'createProfile': {},
  'updateProfile': {},
  'createBundle': {}
});

module.exports = actions;