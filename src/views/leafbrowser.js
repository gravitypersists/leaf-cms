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
          <div class='add-leaf'>
            <i class="fa fa-plus"></i>
          </div>
          <div class='add-bundle'>
            <i class="fa fa-caret-square-o-right"></i>
          </div>
        </div>
        <div class='top-bundle-children bundle-children'></div>
      </div>
    `);
    let $bundle = this.$el.find('.top-bundle');
    this.$el.find('.add-bundle').on('click', (e) => {
      this.promptForNewBundle($bundle, null);
    });
    this.$el.find('.add-leaf').on('click', (e) => {
      this.promptForNewLeaf($bundle, null);
    });

    // we need to recursively build for each bundle 
    // and each bundle's children bundles

    // I'll want to avoid rerendering this whole thing on each update
    bundleStore.listen((bundles) => {
      let $childrenContainer = this.$el.find('.top-bundle-children');
      $childrenContainer.empty();

      // first filter bundles at the top node
      let topBundles = _.filter(bundles, (b) => b.parent === undefined);
      // then recursively build the dom
      this.renderBundlesIntoEl(topBundles, $childrenContainer);
    });
  }

  // recursive function
  renderBundlesIntoEl(bundles, $el) {
    _.each(bundles, (bundle) => {
      let $bundle = $(`
        <div class='bundle collapsed'>
          <div class='bundle-label'>${ bundle.name }</div>
          <div class='bundle-controls'>
            <div class='add-leaf'>
              <i class="fa fa-plus"></i>
            </div>
            <div class='add-bundle'>
              <i class="fa fa-caret-square-o-right"></i>
            </div>
          </div>
          <div class='bundle-children'></div>
        </div>
      `);
      let $children = $bundle.children('.bundle-children');
      $bundle.find('.add-bundle').on('click', (e) => {
        this.promptForNewBundle($bundle, bundle.id);
      });
      $bundle.find('.add-leaf').on('click', (e) => {
        this.promptForNewLeaf($bundle, bundle.id);
      });
      $el.append($bundle);
      $bundle.children('.bundle-label').on('click', (e) => {
        this.toggleBundle($bundle)
      });
      let childrenBundles = bundleStore.getBundlesByIds(bundle.bundles);
      this.renderBundlesIntoEl(childrenBundles, $children);
      // let childrenLeafs = leafStore.getLeafsByIds(bundle.leafs);
      // SEE FUCK IT IN stores/bundles.js FOR MORE WTFs
      let childrenLeafs = _.filter(_.values(bundle.leafs), (l) => !_.isBoolean(l));
      this.renderLeafsIntoEl(childrenLeafs, $children);
    });
  }

  renderLeafsIntoEl(leafs, $el) {
    _.each(leafs, (leaf) => {
      let $leaf = $(`
        <div class='leaf-label'>${ leaf.name }</div>
      `);
      $el.append($leaf);
    })
  }

  toggleBundle($bundle) {
    $bundle.toggleClass('expanded').toggleClass('collapsed');
  }

  promptForNewBundle($parentBundle, parentBundleId) {
    this.promptUser($parentBundle, 'bundle', (name) => {
      actions.createBundle({ name }, parentBundleId);
    });
  }

  promptForNewLeaf($parentBundle, parentBundleId) {
    this.promptUser($parentBundle, 'leaf', (name) => {
      actions.createLeaf({ name }, parentBundleId);
    });
  }

  promptUser($parent, type, callback) {
    let $dom = $(`
      <div class='${ type }-label prompt'>
        <input type='text' class='new-${ type }-prompt'>
      </div>
    `);
    let $input = $dom.find('input');
    $parent.children('.bundle-children').prepend($dom);
    $input.focus();
    $input.on('keydown', (e) => {
      if (e.which === 13) { // enter
        $dom.remove();
        callback($input.val())
        
      } else if (e.which === 27) { // esc
        $dom.remove();
      }
    });
    $input.on('blur', (e) => $dom.remove());
  }

}

module.exports = LeafBrowser;