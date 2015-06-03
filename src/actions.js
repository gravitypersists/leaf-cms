const _ = require('lodash');
const Reflux = require('reflux');
const Firebase = require('firebase');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');
let bundlesRef = ref.child('bundles');
let usersRef = ref.child('users');
let leafsRef = ref.child('leafs');
let leafConfigsRef = ref.child('configs');

let currentUser = null;

let actions = Reflux.createActions({ 
  'login': {},
  'completeLogin': {},
  'logout': {},
  'updateProfile': {},
  'createBundle': {},
  'addBundle': {},
  'createLeaf': {},
  'addLeafToBundle': {},
  'addBundleToBundle': {},
  'addBundleToUser': {},
  'updateLeaf': {},
  'gotoLeaf': { asyncResult: true },
  'thenGotoLeaf': {}
});

let defaultConfig = {
  "content": {
    "0": {
      "layerId": "0",
      "children": {
        "0": {
          "elementId": 0,
          "type": "Text",
          "config": {
            "text": {
              "content": "Welcome to LeafBuilder."
            }
          }
        }
      },
      "layout": {
        "type": "Document",
        "config": {
          "width": "726px",
          "array": ["0"]
        }
      }
    }
  }
}


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

actions.login.listen((authData) => {
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
      actions.completeLogin(firstValueOfObject);

    } else {

      // we must create the user
      let defaultUser = {
        uid: '',
        name: '',
        email: '',
        avatar_url: '',
        bundles: {}
      };
      let payload = {};
      _.defaults(user, defaultUser);
      // we create a workspace for them, which is just a bundle
      let workspace = { 'type': 'User', 'owner': user.uid };
      let workspaceKey = bundlesRef.push(workspace).key();
      user.workspace = workspaceKey;
      payload[user.uid] = user;

      usersRef.set(payload, (error) => {
        if (error) { 
          console.error(error);
        } else {
          actions.updateProfile(user);
          actions.completeLogin(user);
        }
      });

    };

  });

});

actions.completeLogin.preEmit = function(user) {
  currentUser = user;

  // bind to user's workspace
  let userWorkspaceBundlesRef = bundlesRef.child(user.workspace + '/bundles');
  userWorkspaceBundlesRef.on('child_added', (userBundle) => {

    // For each top level bundle in the workspace
    let id = userBundle.key();
    bundlesRef.child(id).on('value', (bundleSnap) => {

      // Once we have the top level bundles, we add them with an action
      let bundle = bundleSnap.val();
      bundle.id = bundleSnap.key();
      actions.addBundleToBundle(bundle, user.workspace);

      // That action above has another pre-emit hook below.
      // It will bind the bundle's child added for children
      // bundles and leafs

    });
  });

  // Similar action for leafs. Might be worth considering
  // abstracting this.
  let userWorkspaceLeafsRef = bundlesRef.child(user.workspace + '/leafs');
  userWorkspaceLeafsRef.on('child_added', (userLeaf) => {
    let id = userLeaf.key();
    leafsRef.child(id).on('value', (leafSnap) => {
      let leaf = leafSnap.val();
      leaf.id = leafSnap.key();
      actions.addLeafToBundle(leaf, user.workspace);
    });
  });

}

actions.createBundle.preEmit = function(bundle = {}, parentId) {

  let defaultBundle = {
    name: 'Loose leafs',
    type: 'Public'
  };

    // Define the bundle to be stored
  _.defaults(bundle, defaultBundle);
  bundle.owner = currentUser.uid;
  bundle.parent = (parentId === 'top') ? currentUser.workspace : parentId;
  let newKey = bundlesRef.push(bundle).key();

  // Add the bundle ref to its parent bundle ref
  bundlesRef.child(bundle.parent + '/bundles/' + newKey).set(true);

}

actions.addBundleToBundle.preEmit = function(childBundle, parentBundleId) {

  // We need to bind the bundle's children bundles
  let bundlesBundlesRef = bundlesRef.child(childBundle.id + '/bundles');
  bundlesBundlesRef.on('child_added', (childBundleSnap) => {
    let childBundleKey = childBundleSnap.key();
    bundlesRef.child(childBundleKey).on('value', (childBundleSnap) => {
      let newChild = childBundleSnap.val();
      newChild.id = childBundleSnap.key();
      actions.addBundleToBundle(newChild, childBundle.id);
    });
  });

  // And the bundle's children leafs
  let bundlesLeafsRef = bundlesRef.child(childBundle.id + '/leafs');
  bundlesLeafsRef.on('child_added', (childLeafSnap) => {
    let leafKey = childLeafSnap.key();
    leafsRef.child(leafKey).on('value', (leafSnap) => {
      let leaf = leafSnap.val();
      leaf.id = leafSnap.key();
      actions.addLeafToBundle(leaf, childBundle.id);
    });
  });

}

actions.createLeaf.preEmit = function(leaf = {}, parentId) {
  let defaultLeaf = {
    name: '',
    snapshots: []
  };
  _.defaults(leaf, defaultLeaf);
  // Create snapshots, as part of leaf.
  if (leaf.snapshots.length === 0) {
    let newConfig = leafConfigsRef.push(JSON.stringify(defaultConfig)).key();
    leaf.snapshots.push({
      birth: Date.now(),
      last_touch: Date.now(),
      config: newConfig,
    });
  }
  leaf.owner = currentUser.uid;
  // parent won't be needed in the future, it's for convenience now
  leaf.parent = (parentId === 'top') ? currentUser.workspace : parentId;
  // Add it to firebase
  leaf.id = leafsRef.push(leaf).key();
  // And give it to parent bundle
  bundlesRef.child(leaf.parent + '/leafs/' + leaf.id).set(true);
}

actions.updateLeaf.preEmit = function(leaf) {
  leafsRef.child(leaf.id).set(leaf);
}

// TODO figure out how to avoid two actions here? gotoLeaf and thenGotoLeaf
actions.gotoLeaf.listen(function(leaf) {
  let sorted = _.sortBy(leaf.snapshots, (s) => s.last_touch);
  leafConfigsRef.child(_.first(sorted).config).once('value', (configSnap) => {
    leaf.loadedConfig = JSON.parse(configSnap.val());
    leaf.loadedConfig.id = configSnap.key();
    actions.gotoLeaf.completed();
    actions.thenGotoLeaf(leaf);
  });
});


module.exports = actions;