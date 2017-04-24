import React, { PropTypes } from 'react';
import * as userAction from '../actions/user';
import * as navigationAction from '../actions/navigation';
import FormView from '../components/form';
import {
  VIEW_LOGIN,
} from '../constants/urls';

class Register extends FormView {
  constructor(props) {
    super(props);
    this.state.fields = [
      {
        label: 'Username',
        id: 'account',
        autoFocus: true,
      },
      {
        label: 'Email Address',
        id: 'email',
      },
      {
        label: 'Password',
        id: 'password',
        type: 'password',
      },
    ];
  }
  getSubmitText() {
    const {
      status,
    } = this.state;
    if (status === 'submitting') {
      return 'Creating an account...';
    }
    return 'Create an account';
  }
  handleSubmit(e) {
    e.preventDefault();
    const {
      status,
    } = this.state;
    if (status === 'submitting') {
      return;
    }
    const { dispatch } = this.props;
    const { account, password, email } = this.getData();
    let error = '';
    if (!account || !password || !email) {
      error = 'Account Password and Email can\'t be empty';
    } else {
      if (password.length < 6) {
        error = 'Password catn\'t be less than 6 character!';
      }
      if (account.length < 4) {
        error = 'Account catn\'t be less than 4 character!';
      }
    }
    if (error) {
      this.setState({
        error,
      });
      return;
    }
    this.setState({
      status: 'submitting',
    });
    dispatch(userAction.register(account, password, email))
      .then(() => {
        dispatch(navigationAction.back());
      })
      .catch((err) => {
        this.setState({
          status: '',
          error: err.response.body.message,
        });
      });
  }
  render() {
    const { dispatch } = this.props;
    return (
      <div className="login-register-container">
        <h3 className="tac">Join Albi</h3>
        {
          this.renderError()
        }
        {
          super.render()
        }
        <a
          href={VIEW_LOGIN}
          onClick={(e) => {
            e.preventDefault();
            dispatch(navigationAction.to(VIEW_LOGIN));
          }}
          className="create-account"
        >Login</a>
      </div>
    );
  }
}

Register.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default Register;
