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
import * as utils from '../helpers/utils';

const BASIC_INFO = 'BASIC_INFO';
const STARS = 'STARS';
const STAR_MODULE = 'STAR_MODULE';
const UNSTAR_MODULE = 'UNSTAR_MODULE';
const STAR_MODULE_UPDATE = 'STAR_MODULE_UPDATE';

const userBehavior = store.get('userBehavior') || [];

const defaultState = {
  token: utils.token(),
  basic: {},
  star: {
    token: utils.token(),
    modules: [],
  },
};

function user(state = defaultState, action) {
  const token = utils.token;
  switch (action.type) {
    case BASIC_INFO:
      return _.extend(state, {
        token: token(),
        basic: action.data,
      });
    case STARS:
      return _.extend(state, {
        star: {
          token: token(),
          modules: action.data,
        },
      });
    case STAR_MODULE: {
      const modules = state.star.modules.slice(0);
      modules.push(action.data);
      return _.extend(state, {
        star: {
          token: token(),
          modules,
        },
      });
    }
    case UNSTAR_MODULE: {
      const name = action.data.name;
      const modules = _.filter(state.star.modules, item => item.name !== name);
      return _.extend(state, {
        star: {
          token: token(),
          modules,
        },
      });
    }
    case STAR_MODULE_UPDATE: {
      const name = action.data.name;
      const modules = _.filter(state.star.modules, item => item.name !== name);
      modules.push(action.data);
      return _.extend(state, {
        star: {
          token: token(),
          modules,
        },
      });
    }
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
  return http.post(`${USER_STAR}/${module}`)
    .then(res => userStore.dispatch({
      type: STAR_MODULE,
      data: res.body,
    }));
}

export function removeStar(module) {
  return http.del(`${USER_STAR}/${module}`)
    .then(() => userStore.dispatch({
      type: UNSTAR_MODULE,
      data: {
        name: module,
      },
    }));
}

export function updateStar(module) {
  return http.put(`${USER_STAR}/${module}`)
    .then(res => userStore.dispatch({
      type: STAR_MODULE_UPDATE,
      data: res.body,
    }));
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
