import store from 'store';
import _ from 'lodash';
import { createStore } from 'redux';

import * as http from '../helpers/http';
import * as globals from '../helpers/globals';
import {
  USER_ME,
  USER_LOGOUT,
  USER_BEHAVIOR,
  USER_STAR,
} from '../constants/urls';
import * as locationService from './location';

const BASIC_INFO = 'BASIC_INFO';
const STARS = 'STARS';

const userBehavior = store.get('userBehavior') || [];

function user(state = {}, action) {
  switch (action.type) {
    case BASIC_INFO:
      return _.extend(state, {
        basic: action.data,
      });
    case STARS:
      return _.extend(state, {
        stars: action.data,
      })
    default:
      return state;
  }
}

const userStore = createStore(user);

export function subscribe(...args) {
  return userStore.subscribe(...args);
}

export function getState() {
  return userStore.getState();
}

export function me() {
  return http.get(USER_ME)
    .noCache()
    .then(res => userStore.dispatch({
      type: BASIC_INFO,
      data: res.body,
    }));
}

export function logout() {
  return http.del(USER_LOGOUT)
    .noCache()
    .then(() => userStore.dispatch({
      type: BASIC_INFO,
      data: {
        account: '',
      },
    }));
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
    .then(res => userStore.dispatch({
      type: STARS,
      data: res.body,
    }));
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
