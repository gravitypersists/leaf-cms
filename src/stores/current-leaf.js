const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let currentLeaf = {};

let currentLeafStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  thenGotoLeaf: function(leaf) {
    this.trigger(leaf);
  },

  gotoLeaf: function(leaf) {
    this.trigger(leaf);
  }

});

module.exports = currentLeafStore;
