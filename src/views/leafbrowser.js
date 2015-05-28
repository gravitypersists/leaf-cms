const $ = require('jquery');
const _ = require('lodash');
const Firebase = require('firebase');
const actions = require('../actions');
const leafStore = require('../stores/leafs');
const bundleStore = require('../stores/bundles');

class LeafBrowser {

  constructor($el) {
    this.$el = $el;
    this.render();
  }

  render() {
    this.$el.html(`
      <div class='top-bundle bundle expanded'>
        <div class='top-controls bundle-controls'>
          <div class='add-bundle'>
            <i class="fa fa-caret-square-o-right"></i>
          </div>
          <div class='add-leaf'>
            <i class="fa fa-plus"></i>
          </div>
        </div>
        <div class='bundle-children'></div>
      </div>
    `);
    let $bundle = this.$el.find('.bundle');
    this.$el.find('.add-bundle').on('click', (e) => {
      this.promptForNewBundle($bundle, null);
    });

    // we need to recursively build for each bundle 
    // and each bundle's children bundles

    // I'll want to avoid rerendering this whole thing on each update
    bundleStore.listen((bundles) => {
      let $childrenContainer = this.$el.children('.bundle').children('.bundle-children');
      $childrenContainer.empty();
      // first filter bundles at the top node

      // then recursively build the dom
      this.renderBundlesIntoEl(bundles, $childrenContainer);
    });
  }

  // recursive function
  renderBundlesIntoEl(bundles, $el) {
    _.each(bundles, (bundle) => {
      let $bundle = $(`
        <div class='bundle collapsed'>
          <div class='bundle-label'>${ bundle.name }</div>
          <div class='bundle-controls'>
            <div class='add-bundle'>
              <i class="fa fa-caret-square-o-right"></i>
            </div>
            <div class='add-leaf'>
              <i class="fa fa-plus"></i>
            </div>
          </div>
          <div class='bundle-children'></div>
        </div>
      `);
      let $child = $bundle.find('.bundle-children');
      $el.append($bundle);
      $bundle.on('click', (e) => this.toggleBundle($bundle));
      this.renderBundlesIntoEl(bundle.bundles, $child);
    });
  }

  toggleBundle($bundle) {
    $bundle.toggleClass('expanded').toggleClass('collapsed');
  }

  promptForNewBundle($parentBundle, parentBundleId) {
    let $dom = $(`
      <div class='bundle-label'>
        <input type='text' class='new-bundle-prompt'>
      </div>
    `);
    let $input = $dom.find('input');
    $parentBundle.children('.bundle-children').before($dom);
    $input.focus();
    $input.on('keydown', (e) => {
      if (e.which === 13) {
        $dom.remove();
        actions.createBundle({ name: $input.val() }, parentBundleId);
      }
    });
  }

}

module.exports = LeafBrowser;