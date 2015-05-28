const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');
let userStore = require('./user');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let bundlesRef = ref.child('bundles');
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

  getAll: function() {
    return bundles;
  },

  completeLogin: function(user) {
    // reset data
    bundles = [];
    // need to unbind old listeners or perhaps recreate data store?

    // bind to user's registered bundles
    userBundlesIndexRef = ref.child('users/' + user.uid + '/bundles');
    userBundlesIndexRef.on('child_added', (userBundle) => {
      let id = userBundle.key();
      bundlesRef.child(id).once('value', (bundle) => {
        bundles.push(bundle.val());
        this.trigger(bundles);
      });
    });
  },

  // TODO: consider using firebase transactions for atomic operations
  // https://www.firebase.com/docs/web/api/firebase/transaction.html
  createBundle: function(bundle = {}, parentBundleId) {
    _.defaults(bundle, defaultBundle);
    bundle.owner = userStore.getUser().uid;
    let newBundleRef = bundlesRef.push(bundle);
    // this index should be registered... if not I want it to fail to know why.
    userBundlesIndexRef.child(newBundleRef.key()).set(true);
  },

  // deleteBundle: funct ... needed???

});

module.exports = bundleStore;