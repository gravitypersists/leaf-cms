const Firebase = require('firebase');
const actions = require('../actions');
const userStore = require('../stores/user');
const React = require('react');
const SigninButtons = require('./signin-buttons');
const UserAccount = require('./user-account');

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = { user: userStore.getUser() };
  }

  componentDidMount() {
    userStore.listen(this.onUser.bind(this));
  }

  onUser(user) {
    this.setState({user});
  }

  render() {
    return (
      <div>
        <div className='main-logo'></div>
        <div className='user-account'>
          { 
            (this.state.user.uid.length > 0) ?
              <UserAccount user={this.state.user} /> : <SigninButtons />
          }
        </div>
      </div>
    );
  }

}

module.exports = Header;