const Reflux = require('reflux')

let actions = Reflux.createActions({ 
  'login': {},
  'logout': {},
  'createProfile': {},
  'updateProfile': {}
});

module.exports = actions;