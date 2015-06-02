const $ = require('jquery');
const _ = require('lodash');
const Firebase = require('firebase');
const actions = require('../actions');

let currentLeafStore = require('../stores/current-leaf');

class Toolbar {

  constructor($el) {
    this.$el = $el;
    currentLeafStore.listen((leaf) => this.render(leaf));
  }

  render(leaf) {
    this.$el.html(`
      <div class='leaf-title' spellcheck='false' contenteditable=true>
        ${ leaf.name }
      </div>
    `);
    let $title = this.$el.find('.leaf-title');
    $title.on('keyup', (e) => {
      leaf.name = $title.text();
      actions.updateLeaf(leaf);
    });
  }

}

module.exports = Toolbar;
