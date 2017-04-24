import {
  USER_INFO,
} from '../constants/action-types';
import * as user from '../services/user';

export function login(account, password) {
  return dispatch => user.login(account, password).then(data => dispatch({
    type: USER_INFO,
    user: data,
  }));
}

export function register(account, password, email) {
  return dispatch => user.add(account, password, email).then(data => dispatch({
    type: USER_INFO,
    user: data,
  }));
}

export function me() {
  return dispatch => user.me().then(data => dispatch({
    type: USER_INFO,
    user: data,
  }));
}

export function logout() {
  return dispatch => user.logout().then(data => dispatch({
    type: USER_INFO,
    user: data,
  }));
}
