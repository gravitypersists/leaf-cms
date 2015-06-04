const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let bundles = {};

let bundleStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  getBundleTree: function() { return bundles; },

  // searches bundle tree recursively to find our bundle or leaf
  getResourceById: function(id = null) {
    if (bundles.id === id) return bundles;
    let recurse = function(bunds) {
      let loaded = (bunds.loadedBundles || []).concat(bunds.loadedLeafs || []);
      for (let i = 0; i < loaded.length; i++) {
        let resource = loaded[i];
        if (resource.id === id) return resource;
        let keepGoing = recurse(resource);
        if (keepGoing) return keepGoing;
      }
    }
    return recurse(bundles);
  },

  // getResourceById with safety to create top level bundle if it
  // doesn't exist yet, assuming it's the workspace
  ensureBundleById: function(id) {
    let parentBundle = this.getResourceById(id);
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

  // ###### all methods below are ACTIONS ######

  completeLogin: function(user) {
    bundles = {}; // reset data
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
  },

  gotoLeafById: function(leafId) {
    let leaf = this.getResourceById(leafId);
    if (leaf) actions.gotoLeaf(leaf);
  }

});

module.exports = bundleStore;