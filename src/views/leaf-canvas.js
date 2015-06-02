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
    `);
    let toolbar = new Toolbar(this.$el.find('.toolbar'));
  }

}

module.exports = LeafCanvas;
