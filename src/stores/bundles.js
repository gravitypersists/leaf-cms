const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let bundles = {};

let bundleStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  getBundleTree: function() { return bundles.loadedBundles; },

  // searches bundle tree recursively to find our bundle
  getBundleById: function(id) {
    let recurse = function(bunds) {
      let loaded = bunds.loadedBundles || [];
      for (let i = 0; i < loaded.length; i++) {
        let bundle = loaded[i];
        if (bundle.id === id) return bundle;
        let keepGoing = recurse(bundle);
        if (keepGoing) return keepGoing;
      }
    }
    return recurse(bundles);
  },

  getBundlesByIds: function(ids) { 
    return _.compact(_.map(ids, (__, key) => this.getBundleById(key)));
  },

  completeLogin: function(user) {
    bundles = {}; // reset data
  },

  // deleteBundle: funct ... needed???

  addBundleToBundle: function(childBundle, parentBundleId) {
    let parentBundle = this.getBundleById(parentBundleId);
    // It doesn't exist in the tree yet, assume it's the workspace
    if (!parentBundle) {
      bundles = { id: parentBundleId };
      parentBundle = bundles;
    }
    parentBundle.loadedBundles = parentBundle.loadedBundles || [];
    parentBundle.loadedBundles.push(childBundle);
    this.trigger(bundles.loadedBundles);
  },

  addLeafToBundle: function(leaf, bundleId) {
    let childBundle = this.getBundleById(bundleId);
    let existingLeaf = _.find(childBundle.leafs, (l) => l.id === leaf.id);
    if (existingLeaf) {
      existingLeaf = leaf;
    } else {
      childBundle.leafs.push(leaf);
    }
  }

});

module.exports = bundleStore;