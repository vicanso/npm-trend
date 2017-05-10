import store from 'store';
import _ from 'lodash';
import EventEmitter from 'events';

import * as http from '../helpers/http';
import * as globals from '../helpers/globals';
import {
  USER_ME,
  USER_LOGOUT,
  USER_BEHAVIOR,
  USER_STAR,
} from '../constants/urls';
import * as locationService from './location';

const userBehavior = store.get('userBehavior') || [];
const emiter = new EventEmitter();

export function on(...args) {
  emiter.on(...args);
}

export function off(...args) {
  emiter.off(...args);
}

export function me() {
  return http.get(USER_ME)
    .noCache()
    .then((res) => {
      const userInfo = res.body;
      emiter.emit('session', userInfo);
      return userInfo;
    });
}

export function logout() {
  return http.del(USER_LOGOUT)
    .noCache()
    .then((res) => {
      const userInfo = res.body || { account: '' };
      emiter.emit('session', userInfo);
      return userInfo;
    });
}

export function addStar(module) {
  return http.post(`${USER_STAR}/${module}`);
}

export function removeStar(module) {
  return http.del(`${USER_STAR}/${module}`);
}

export function updateStar(module) {
  return http.put(`${USER_STAR}/${module}`);
}

export function getStars() {
  return http.get(USER_STAR)
    .noCache()
    .then(res => res.body);
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
