const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let leafsRef = ref.child('leafs');

let leafs = [];

let leafStore = Reflux.createStore({

  listenables: actions,

  init: function() {

  },

  getAll: function() { return leafs; },

  createLeaf: function(leaf, parentBundleId) {}

});

module.exports = leafStore;