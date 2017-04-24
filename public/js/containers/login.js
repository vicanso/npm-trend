import React, { PropTypes } from 'react';
import * as userAction from '../actions/user';
import * as navigationAction from '../actions/navigation';
import {
  VIEW_REGISTER,
} from '../constants/urls';
import FormView from '../components/form';

class Login extends FormView {
  constructor(props) {
    super(props);
    this.state.fields = [
      {
        label: 'Username',
        id: 'account',
        autoFocus: true,
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
      return 'Signing In...';
    }
    return 'Sign In';
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
    const { account, password } = this.getData();
    let error = '';
    if (!account || !password) {
      error = 'Account and Password can\'t be empty';
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
    dispatch(userAction.login(account, password))
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
        <h3 className="tac">Sign in to Albi</h3>
        {
          this.renderError()
        }
        {
          super.render()
        }
        <a
          href={VIEW_REGISTER}
          onClick={(e) => {
            e.preventDefault();
            dispatch(navigationAction.to(VIEW_REGISTER));
          }}
          className="create-account"
        >Create an account.</a>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default Login;
