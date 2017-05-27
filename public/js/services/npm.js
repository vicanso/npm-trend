import _ from 'lodash';
import moment from 'moment';
import store from 'store';
import Promise from 'bluebird';

import * as http from '../helpers/http';
import {
  NPM_COUNT,
  NPM_DOWNLOADS,
  NPM_STATS,
} from '../constants/urls';

const compareStoreKey = 'compareModules';

export function count(query) {
  return http.get(NPM_COUNT, query)
    .then(res => res.body.count);
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

function getDownloads(name, days, interval = 1) {
  const begin = moment().add(-days, 'day').format('YYYY-MM-DD');
  const url = NPM_DOWNLOADS.replace(':name', name);
  return http.get(url, {
    begin,
    interval,
  }).then(res => res.body);
}

export function getDownloadsChartData(modules, days, interval) {
  const fns = _.map(modules, module => getDownloads(
    module,
    days,
    interval,
  ));
  return Promise.all(fns).then((data) => {
    const categories = [];
    const chartData = _.map(data, (arr, index) => {
      const series = {
        name: modules[index],
      };
      series.data = _.map(arr, (item) => {
        if (index === 0) {
          categories.push(item.date);
        }
        return item.count;
      });
      return series;
    });
    return {
      categories,
      data: chartData,
    };
  });
}

export function getNPMStatsChartData(days, interval) {
  const begin = moment().add(-days, 'day').format('YYYY-MM-DD');
  return http.get(NPM_STATS, {
    begin,
    interval,
  }).then((res) => {
    const categories = [];
    const keys = 'created updated modules'.split(' ');
    const chartData = [];
    _.forEach(keys, key => chartData.push({
      name: key,
      data: [],
    }));
    _.forEach(res.body, (item) => {
      categories.push(item.date);
      _.forEach(keys, (key, index) => {
        chartData[index].data.push(item[key]);
      });
    });
    return {
      categories,
      data: chartData,
    };
  });
}
