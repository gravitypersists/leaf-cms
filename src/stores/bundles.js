const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let bundles = {};

let bundleStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  getBundleTree: function() { return bundles; },

  // searches bundle tree recursively to find our bundle
  getBundleById: function(id = null) {
    if (bundles.id === id) return bundles;
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

  // getBundleById with safety to create top level bundle if it
  // doesn't exist yet, assuming it's the workspace
  ensureBundleById: function(id) {
    let parentBundle = this.getBundleById(id);
    if (!parentBundle) {
      bundles = { id };
      parentBundle = bundles;
    }
    return parentBundle;
  },

  setOrPush: function(col, child) {
    let finding = _.findIndex(col, (c) => c.id === child.id);
    if (finding > -1) {
      col[finding] = child; // replace it
    } else {
      col.push(child); // add it
    }
  },

  addBundleToBundle: function(childBundle, parentBundleId) {
    let parentBundle = this.ensureBundleById(parentBundleId);
    parentBundle.loadedBundles = parentBundle.loadedBundles || [];
    this.setOrPush(parentBundle.loadedBundles, childBundle);
    this.trigger(bundles);
  },

  addLeafToBundle: function(leaf, parentBundleId) {
    let parentBundle = this.ensureBundleById(parentBundleId);
    parentBundle.loadedLeafs = parentBundle.loadedLeafs || [];
    this.setOrPush(parentBundle.loadedLeafs, leaf);
    this.trigger(bundles);
  }

});

module.exports = bundleStore;