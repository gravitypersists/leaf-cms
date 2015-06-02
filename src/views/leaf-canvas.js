const $ = require('jquery');
const _ = require('lodash');
const Firebase = require('firebase');
const Toolbar = require('./toolbar');
const actions = require('../actions');

let currentLeafStore = require('../stores/current-leaf');

class LeafCanvas {

  constructor($el) {
    this.$el = $el;
    this.$el.html(`
      <div class='toolbar'></div>
      <div class='leafbuilder-container'></div>
    `);
    let toolbar = new Toolbar(this.$el.find('.toolbar'));
    currentLeafStore.listen((leaf) => this.onNewLeaf(leaf));
  }

  onNewLeaf(leaf) {
    this.$el.find('.leafbuilder-container').html(JSON.stringify(leaf.loadedConfig));
  }

}

module.exports = LeafCanvas;
