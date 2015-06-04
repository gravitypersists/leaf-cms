const _ = require('lodash');
const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let usersRef = ref.child('users');

let defaultUser = {
  uid: '',
  name: '',
  email: '',
  avatar_url: '',
  bundles: {},
  state: {
    'current_leaf': null
  }
};

let userStore = Reflux.createStore({

  listenables: actions,

  init: function() {
    this.user = defaultUser;
  },

  getUser: function() { return this.user; },

  logout: function() {
    this.user = defaultUser;
    this.trigger(this.user);
  },

  updateProfile: function(user) {
    this.user = user;
    if (user.state && user.state.current_leaf) {
      actions.gotoLeafWhenReady(user.state.current_leaf);
    }
    this.trigger(this.user);
  },

  gotoLeaf: function(leaf) {
    usersRef.child(this.user.uid + '/state/current_leaf').set(leaf.id);
  }

});

module.exports = userStore;