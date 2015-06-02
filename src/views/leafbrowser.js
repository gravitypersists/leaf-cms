const $ = require('jquery');
const _ = require('lodash');
const Firebase = require('firebase');
const actions = require('../actions');
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
      this.promptForNewBundle($bundle, 'top');
    });
    this.$el.find('.add-leaf').on('click', (e) => {
      this.promptForNewLeaf($bundle, 'top');
    });

    // we need to recursively build for each bundle 
    // and each bundle's children bundles

    // I'll want to avoid rerendering this whole thing on each update
    bundleStore.listen((bundleTree) => {
      let $childrenContainer = this.$el.find('.top-bundle-children');

      // then recursively build the dom
      this.renderBundlesIntoEl(bundleTree.loadedBundles, $childrenContainer);
      this.renderLeafsIntoEl(bundleTree.loadedLeafs, $childrenContainer);
    });
  }

  // recursive function
  renderBundlesIntoEl(bundles, $el) {
    _.each(_.sortBy(bundles, 'name'), (bundle) => {
      // Since I decided against virtual dom, I need to check for
      // existing els or decide to create a new one. Rather than
      // aim for immutability, I'm thinking about how to categorize
      // mutations, and this "create or update on render" is just
      // an experiment for the time being.
      let $bundle = $el.children(`[data-bundle-id='${bundle.id}']`);

      if ($bundle.length === 0) {

        $bundle = $(`
          <div class='bundle collapsed' data-bundle-id='${ bundle.id }'>
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
        
      } else {
        // This is the ugly part, manually handle bundle title updates
        // and whatever mutations that can occur
      }

      let $children = $bundle.children('.bundle-children');
      this.renderBundlesIntoEl(bundle.loadedBundles, $children);
      this.renderLeafsIntoEl(bundle.loadedLeafs, $children);
    });
  }

  renderLeafsIntoEl(leafs, $el) {
    // First clear out old ones (because we're not rerendering)
    $el.children('.leaf-label').remove();
    _.each(_.sortBy(leafs, 'name'), (leaf) => {
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