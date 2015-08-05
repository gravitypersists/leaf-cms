const React = require('react');
const actions = require('../actions');

class SigninButtons extends React.Component {

  render() {
    return (
      <div>
        <div className='sign-up with-facebook' onClick={this.handleFacebookClick}>
          Sign in with Facebook
        </div>
        <div className='sign-up with-github' onClick={this.handleGithubClick}>
          Sign in with Github
        </div>
      </div>
    );
  }

  handleFacebookClick() {
    actions.authWithFacebook();
  }

  handleGithubClick() {
    actions.authWithFacebook();
  }

}

module.exports = SigninButtons;

