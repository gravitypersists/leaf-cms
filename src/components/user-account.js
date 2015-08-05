const React = require('react');
const actions = require('../actions');

class UserAccount extends React.Component {

  render() {
    return (
      <div>
        <div className='logout' onClick={this.handleLogoutClick}>Logout</div>
        <img className='user-avatar' src={ this.props.user.avatar_url } />
      </div>
    );
  }

  handleLogoutClick() {
    actions.logout();
  }

}

module.exports = UserAccount;

