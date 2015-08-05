const $ = require('jquery');
const _ = require('lodash');
const moment = require('moment');
const Firebase = require('firebase');
const actions = require('../actions');
const bundleStore = require('../stores/bundles');
const currentLeafStore = require('../stores/current-leaf');

class SnapshotControl {

  constructor($el) {
    this.$el = $el;
    this.$el.html(`
      <div class='snapshot-dropdown'>
        <i class="fa fa-history"></i>
        <i class="fa fa-caret-down"></i>
      </div>
      <div class='snapshot-button'>
        <i class="fa fa-thumb-tack"></i>
      </div>
      <div class='snapshot-dropdown-menu'>
        <ul class='snapshots'></ul>
      </div>
    `);
    this.$el.find('.snapshot-button').on('click', this.onSnapshotClick.bind(this));
    this.$el.find('.snapshot-dropdown').on('click', this.onDropdownClick.bind(this));

    currentLeafStore.listen((leaf) => this.renderSnapshots(leaf));
  }

  renderSnapshots(leaf) {
    let sorted = _.sortBy(leaf.snapshots, (s) => s.last_touch);
    let $snapshots = this.$el.find('.snapshots');
    $snapshots.empty();
    _.each(sorted, (snapshot) => {
      $snapshots.append($(`
        <li class='snapshot' data-id='${ snapshot.config }'>
          ${ moment(snapshot.last_touch).fromNow() }
        </li>
      `))
    });
  }

  onSnapshotClick(e) {
    actions.makeNewSnapshot()
  }

  onDropdownClick(e) {
    this.$el.find('.snapshot-dropdown-menu').show();
  }

}

module.exports = SnapshotControl;