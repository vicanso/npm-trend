import moment from 'moment';

import * as http from '../helpers/http';
import {
  NPM_COUNT,
  NPM_DOWNLOADS,
} from '../constants/urls';

export function count(query) {
  return http.get(NPM_COUNT, query)
    .then(res => res.body.count);
}

export function getDownloads(name, days) {
  const begin = moment().add(-days, 'day').format('YYYY-MM-DD');
  const url = NPM_DOWNLOADS.replace(':name', name);
  return http.get(url, {
    begin,
  }).then(res => res.body);
}
