import * as http from '../helpers/http';
import {
  NPM_COUNT,
} from '../constants/urls';

export function count(query) {
  return http.get(NPM_COUNT, query)
    .then(res => res.body.count);
}
