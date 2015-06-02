const $ = require('jquery');
const _ = require('lodash');
const Firebase = require('firebase');
const actions = require('../actions');
const currentLeafStore = require('../stores/current-leaf');

class LeafCanvas {

  constructor($el) {
    this.$el = $el;
    currentLeafStore.listen((leaf) => this.render(leaf));
  }

  render(leaf) {
    this.$el.html(`
      <div class='leaf-title' contenteditable=true>${ leaf.name }</div>
    `);
  }

}

module.exports = LeafCanvas;
