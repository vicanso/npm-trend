import {
  LOCATION,
  LOCATION_BACK,
} from '../constants/action-types';
import {
  VIEW_HOME,
} from '../constants/urls';
import * as globals from '../helpers/globals';

const initSatte = {
  location: globals.get('location.pathname'),
  history: [],
};

export default function navigation(state = initSatte, action) {
  const history = globals.get('history');
  switch (action.type) {
    case LOCATION: {
      if (state.location === action.path) {
        return state;
      }
      const list = state.history.slice(0);
      list.push(state.location);
      history.pushState(null, '', action.path);
      return Object.assign({}, state, {
        location: action.path,
        history: list,
      });
    }
    case LOCATION_BACK: {
      const list = state.history.slice(0);
      const path = list.pop() || VIEW_HOME;
      history.pushState(null, '', path);
      return Object.assign({}, state, {
        location: path,
        history: list,
      });
    }
    default:
      return state;
  }
}
