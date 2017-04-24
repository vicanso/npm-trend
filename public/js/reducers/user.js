import {
  USER_INFO,
} from '../constants/action-types';
import * as http from '../helpers/http';

let userToken = '';
// add user token for http request
http.use((req) => {
  if (userToken) {
    req.set('X-User-Token', userToken);
  }
});

const defaultStates = {
};

export default function user(state = defaultStates, action) {
  switch (action.type) {
    case USER_INFO: {
      const data = action.user;
      if (userToken !== data.token) {
        userToken = data.token;
      }
      return Object.assign({}, state, data);
    }
    default:
      return state;
  }
}
