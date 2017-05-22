import _ from 'lodash';
import moment from 'moment';
import store from 'store';

import * as http from '../helpers/http';
import {
  NPM_COUNT,
  NPM_DOWNLOADS,
} from '../constants/urls';

const compareStoreKey = 'compareModules';

export function count(query) {
  return http.get(NPM_COUNT, query)
    .then(res => res.body.count);
}

export function getDownloads(name, days, interval = 1) {
  const begin = moment().add(-days, 'day').format('YYYY-MM-DD');
  const url = NPM_DOWNLOADS.replace(':name', name);
  return http.get(url, {
    begin,
    interval,
  }).then(res => res.body);
}

export function getCompareList() {
  const modules = store.get(compareStoreKey) || [];
  return modules;
}

export function addToCompare(name) {
  const modules = getCompareList();
  if (_.indexOf(modules, name) !== -1) {
    return;
  }
  modules.push(name);
  store.set(compareStoreKey, modules);
}

export function removeFromCompare(name) {
  const modules = getCompareList();
  const index = _.indexOf(modules, name);
  if (index === -1) {
    return;
  }
  modules.splice(index, 1);
  store.set(compareStoreKey, modules);
}

export function clearCompare() {
  store.remove(compareStoreKey);
}
