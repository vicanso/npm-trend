import _ from 'lodash';
import URL from 'url-parse';
import { createStore } from 'redux';

import * as globals from '../helpers/globals';

const history = globals.get('history');
let prevPath = '';
let currentUrl = '';
const CHANGE = 'CHANGE';

const defaultState = {
  prevPath: '',
  path: '',
  query: null,
  url: '',
};

function location(state = defaultState, action) {
  switch (action.type) {
    case CHANGE:
      return _.extend(state, action.data);
    default:
      return state;
  }
}

const locationStore = createStore(location);

function emitChange(url) {
  const urlInfos = new URL(url, true);
  currentUrl = url.replace(urlInfos.origin, '');
  const info = {
    prevPath,
    path: urlInfos.pathname,
    query: urlInfos.query,
    url: currentUrl,
  };
  prevPath = info.path;
  locationStore.dispatch({
    type: CHANGE,
    data: info,
  });
}

export function subscribe(...args) {
  return locationStore.subscribe(...args);
}

export function getState() {
  return locationStore.getState();
}

export function getCurrentUrl() {
  return currentUrl;
}

export function push(url, title = '', emit = true) {
  history.pushState(null, title, url);
  if (emit) {
    emitChange(url);
  }
}

export function relace(url, title = '', emit = true) {
  history.replaceState(null, title, url);
  if (emit) {
    emitChange(url);
  }
}

_.defer(() => emitChange(globals.get('location.href')));

globals.set('onpopstate', () => emitChange(globals.get('location.href')));
