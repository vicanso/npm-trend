import store from 'store';

import * as http from '../helpers/http';
import * as crypto from '../helpers/crypto';
import * as globals from '../helpers/globals';
import {
  USER_ME,
  USER_LOGIN,
  USER_REGISTER,
  USER_LOGOUT,
  USER_BEHAVIOR,
} from '../constants/urls';
import * as locationService from './location';


const userBehavior = store.get('userBehavior') || [];

/* eslint no-undef:0 */
const app = (window.CONFIG && window.CONFIG.app) || 'unknown';

export function me() {
  return http.get(USER_ME)
    .noCache()
    .then(res => res.body);
}

export function add(account, password, email) {
  const pwd = crypto.sha256(password);
  const code = crypto.sha256(`${account}-${pwd}-${app}`);
  return http.post(USER_REGISTER, {
    account,
    password: code,
    email,
  }).noCache().then(res => res.body);
}

export function login(account, password) {
  return http.get(USER_LOGIN)
    .noCache()
    .then((res) => {
      const token = res.body.token;
      const pwd = crypto.sha256(password);
      const code = crypto.sha256(crypto.sha256(`${account}-${pwd}-${app}`) + token);
      return http.post(USER_LOGIN, {
        account,
        password: code,
      }).noCache();
    }).then(res => res.body);
}

export function logout() {
  return http.del(USER_LOGOUT)
    .noCache()
    .then(res => res.body || { account: '' });
}

export function addBehavior(type, data) {
  userBehavior.push(_.extend({
    type,
    url: locationService.getCurrentUrl(),
  }, data));
  if (userBehavior.length >= 10) {
    http.post(USER_BEHAVIOR, userBehavior.slice(0))
      .catch(console.error);
    userBehavior.length = 0;
  }
  store.set('userBehavior', userBehavior);
}

export function visit() {
  const sessionStorage = globals.get('sessionStorage');
  if (!sessionStorage) {
    return;
  }
  if (!sessionStorage.getItem('visited')) {
    sessionStorage.setItem('visited', true);
    addBehavior('uv');
  }
}
