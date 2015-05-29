const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');
let userStore = require('./user');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let bundlesRef = ref.child('bundles');
let leafsRef = ref.child('leafs');
// TODO create a fresh user for non-logged in accounts, after trying to auth them
let userBundlesIndexRef = null; //ref.child('users/ ...unregistered user samples.. /bundles');

let currentUser = [];
let bundles = [];

let defaultBundle = {
  name: 'Loose leafs',
  type: 'Public'
};

let bundleStore = Reflux.createStore({

  listenables: actions,

  init: function() {

  },

  getAll: function() { return bundles; },

  getBundleById: function(id) { return _.find(bundles, (b) => b.id === id); },
  getBundlesByIds: function(ids) { 
    return _.map(ids, (__, key) => this.getBundleById(key));
  },

  completeLogin: function(user) {
    // reset data
    bundles = [];
    // need to unbind old listeners or perhaps recreate data store?

    // bind to user's registered bundles
    userBundlesIndexRef = ref.child('users/' + user.uid + '/bundles');
    userBundlesIndexRef.once('value', (userBundles) => {
      let ids = _.keys(userBundles.val());
      _.each(ids, (id) => {
        // Can I just query for all of these at once?
        bundlesRef.child(id).once('value', (bundle) => {
          let bundleFromFirebase = bundle.val();
          bundleFromFirebase.id = bundle.key();
          bundles.push(bundleFromFirebase);

          // This is super ridiculous, trying to fully load a 
          // model with relational data is absurd with firebase
          _.each(bundleFromFirebase.leafs, (__, leafKey) => {
            leafsRef.child(leafKey).once('value', (leafRef) => {
              let newLeaf = leafRef.val();
              newLeaf.id = leafKey;
              // THIS HAPPENS AFTER
              // actions.addLeaf(newLeaf);
              // THIS DOES. NICE.
              // this.trigger(bundles);
              // SO FUCK IT.
              bundleFromFirebase.leafs[leafKey] = newLeaf;

              // Finally we trigger if all leafs are loaded
              if (_.every(_.values(bundleFromFirebase.leafs), (l) => !_.isBoolean(l))) {
                this.trigger(bundles);
              }
            });
          });
        });
      });
    });
  },

  // TODO: consider using firebase transactions for atomic operations
  // https://www.firebase.com/docs/web/api/firebase/transaction.html
  createBundle: function(bundle = {}, parentBundleId) {
    _.defaults(bundle, defaultBundle);
    bundle.owner = userStore.getUser().uid;
    if (parentBundleId) bundle.parent = parentBundleId;
    let newKey = bundlesRef.push(bundle).key();
    // Now we've created it, we need to ensure it's referenced in
    // whatever models own it, users and other bundles (for nesting)
    if (parentBundleId) {
      bundlesRef.child(parentBundleId + '/bundles')
                .child(newKey).set(true);
    }
    // this index should be registered... if not I want it to fail to know why.
    userBundlesIndexRef.child(newKey).set(true);

    // Finally, update the actual data store. Jesus wtf firebase...
    bundle.id = newKey;
    bundles.push(bundle);
    this.trigger(bundles);
  },

  // deleteBundle: funct ... needed???


  addLeafToBundle: function(leaf, bundleId) {
    bundlesRef.child(bundleId + '/leafs').child(leaf.id).set(true);
  }

});

module.exports = bundleStore;