const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let currentLeaf = {};

let currentLeafStore = Reflux.createStore({

  listenables: actions,

  init: function() {},

  gotoLeaf: function(leaf) {
    this.trigger(leaf);
  }

});

module.exports = currentLeafStore;
