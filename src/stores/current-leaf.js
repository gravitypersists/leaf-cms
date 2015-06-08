const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let currentLeaf = {};
let showLeafWhenReadyId = null;

let currentLeafStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  gotoLeafWhenReady: function(leafId) {
    showLeafWhenReadyId = leafId;
    // Chances are the leaf isn't loaded yet, so this action
    // will result in nothing. I have to listen to when a leaf
    // is added to a bundle to 
    actions.gotoLeafById(leafId);
  },

  thenGotoLeaf: function(leaf) {
    currentLeaf = leaf;
    this.trigger(leaf);
  },

  gotoLeaf: function(leaf) {
    currentLeaf = leaf;
    this.trigger(leaf);
  },

  addLeafToBundle: function(leaf) {
    // Somewhere we said "this is the current leaf" before it
    // was actually downloaded
    if (showLeafWhenReadyId === leaf.id) {
      actions.gotoLeafById(leaf.id);
    }
  }

});

module.exports = currentLeafStore;
