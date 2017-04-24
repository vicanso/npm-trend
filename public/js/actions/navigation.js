import {
  LOCATION,
  LOCATION_BACK,
} from '../constants/action-types';

import {
  VIEW_HOME,
  VIEW_LOGIN,
} from '../constants/urls';

export function to(path) {
  return dispatch => dispatch({
    type: LOCATION,
    path,
  });
}

export function login() {
  return to(VIEW_LOGIN);
}

export function home() {
  return to(VIEW_HOME);
}

export function back() {
  return dispatch => dispatch({
    type: LOCATION_BACK,
  });
}
