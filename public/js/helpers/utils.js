import URL from 'url-parse';
import _ from 'lodash';
import * as globals from '../helpers/globals';

const location = globals.get('location');

function stringify(params) {
  const keys = _.keys(params).sort();
  return _.map(keys, key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export function getQueryParam(key) {
  const search = location.search;
  if (!search) {
    return null;
  }
  const urlInfos = new URL(location.href, true);
  return urlInfos.query[key];
}

export function getUrl(params, extend = true) {
  let currentParams = {};
  const search = location.search;
  if (search && extend) {
    const urlInfos = new URL(location.href, true);
    currentParams = urlInfos.query;
  }
  _.extend(currentParams, params);
  const baseUrl = `${location.origin}${location.pathname}`;
  if (_.isEmpty(currentParams)) {
    return baseUrl;
  }
  return `${baseUrl}?${stringify(currentParams)}`;
}
