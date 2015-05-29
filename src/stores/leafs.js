const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');
let userStore = require('./user');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let leafsRef = ref.child('leafs');

let leafs = [];

let defaultLeaf = {
  name: "Leaf"
}

let leafStore = Reflux.createStore({

  listenables: actions,

  init: function() {

  },

  getAll: function() { return leafs; },
  getLeafById: function(id) { return _.find(leafs, (b) => b.id === id); },
  getLeafsByIds: function(ids) { 
    return _.compact(_.map(ids, (__, key) => this.getLeafById(key)));
  },

  createLeaf: function(leaf, parentBundleId) {
    _.defaults(leaf, defaultLeaf);
    leaf.owner = userStore.getUser().uid;
    leaf.parent = parentBundleId;
    leaf.id = leafsRef.push(leaf).key();

    actions.addLeafToBundle(leaf, parentBundleId);
  },

  addLeaf: function(leaf) {
    leafs.push(leaf);
  }

});

module.exports = leafStore;