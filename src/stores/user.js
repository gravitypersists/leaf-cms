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
  bundles: {}
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
    this.trigger(this.user);
  }
});

module.exports = userStore;