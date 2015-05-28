const $ = require('jquery');
const Firebase = require('firebase');
const actions = require('../actions');
const userStore = require('../stores/user');

let ref = new Firebase('https://leafbuilder-dev.firebaseio.com');

class Header {

  constructor($el) {
    this.$el = $el;
    this.$el.html(`
      <div class='main-logo'></div>
      <div class='user-account'></div>
    `);
    this.renderSelfLoggedOut();
    ref.onAuth(this.handleAuth.bind(this));
    userStore.listen(this.render.bind(this))
  }

  render(user) {
    (user.email) ? this.renderSelfLoggedIn(user) : this.renderSelfLoggedOut();
  }

  renderSelfLoggedOut() {
    this.$el.find('.user-account').html(`
      <div class='sign-up with-facebook'>Sign in with Facebook</div>
      <div class='sign-up with-github'>Sign in with Github</div>
    `);
    this.$el.find('.with-github').on('click', this.authWithGithub.bind(this));
    this.$el.find('.with-facebook').on('click', this.authWithFacebook.bind(this));
  }

  renderSelfLoggedIn(user) {
    this.$el.find('.user-account').html(`
      <div class='logout'>Logout</div>
      <img class='user-avatar' src='${ user.avatar_url }'>
    `);
    this.$el.find('.logout').on('click', this.handleLogoutClick.bind(this));
  }

  handleSignupClick(e) {
    this.authWithGithub();
  }

  // onAuth binds to login and logout
  handleAuth(authData) {
    if (authData) {
      this.handleLogin(authData);
    } else {
      this.handleLogout();
    }
  }

  handleLogin(authData) {
    this.authData = authData;
    actions.login(authData);
    $('.app-body').html('I <3 you, ' + this.authData[this.authData.provider].displayName);
  }

  handleLogoutClick(e) {
    ref.unauth();
  }

  handleLogout() {
    actions.logout();
  }

  authWithGithub() {
    ref.authWithOAuthRedirect("github", (error) => {
      if (error) console.log("Login Failed!", error);
    }, {
      scope: 'user:email'
    });
  }

  authWithFacebook() {
    ref.authWithOAuthPopup("facebook", (error) => {
      if (error) console.log("Login Failed!", error);
    }, {
      scope: 'email'
    });
  }

}

module.exports = Header;