const Reflux = require('reflux');
const actions = require('../actions');
const Firebase = require('firebase');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let usersRef = ref.child('users');

let defaultUser = {
  uid: '',
  name: '',
  email: '',
  avatar_url: '' 
};

// Takes authdata as firebase gives it and returns a standard object
// that is { uid, name, email, avatar_url }
function parseAuthData(authData) {
  let avatar_url = 'http://placekitten.com/61/62';
  if (authData.provider === 'facebook') {
    avatar_url = authData.facebook.cachedUserProfile.picture.data.url;
  } else if (authData.provider === 'facebook')  {
    avatar_url = authData.github.cachedUserProfile.avatar_url;
  }
  let email = authData[authData.provider].email;
  let name = authData[authData.provider].displayName;
  let uid = authData.uid;
  return { uid, name, email, avatar_url };
}


let userStore = Reflux.createStore({

  listenables: actions,

  init: function() {
    this.user = defaultUser;
  },

  // Philosophical thoughts here: this action handler, rather than updating
  // the data store, results in actions. Uni-directional events still occur
  // but the store now emits actions itself, like a view component might.
  // I think this is fine, provided the actions are fired at the end of 
  // each handler and no subsequent logic follows. But we will see...
  login: function(authData) {
    let user = parseAuthData(authData);

    // First we must check to see if the account exists already

    // Maybe I should use uid instead of email? If you switch between
    // fb and github does it desync your uid?
    usersRef.orderByChild('email').equalTo(user.email).once('value', (x) => {

      let firebaseUser = x.val();
      if (firebaseUser) {

        // User exists already
        // what if there are discrepancies between these?
        let firstValueOfObject = firebaseUser[Object.keys(firebaseUser)[0]];
        actions.updateProfile(firstValueOfObject);

      } else {

        // we must create the user
        let payload = {};
        payload[user.uid] = user
        usersRef.set(payload, (error) => {
          if (error) { 
            console.error(error);
          } else {
            actions.updateProfile(user)
          }
        });

      };

    });
  },

  logout: function() {
    this.user = defaultUser;
    this.trigger(this.user);
  },

  updateProfile: function(user) {
    this.user = user;
    this.trigger(this.user);
  },

});

module.exports = userStore;