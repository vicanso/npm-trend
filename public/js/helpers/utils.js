import qs from 'qs';
import _ from 'lodash';
import * as globals from '../helpers/globals';

const location = globals.get('location');

export function getQueryParam(key) {
  const search = location.search;
  if (!search) {
    return null;
  }
  const infos = qs.parse(search.substring(1));
  return infos[key];
}

export function getUrl(params, extend = true) {
  let currentParams = {};
  const search = location.search;
  if (search) {
    currentParams = qs.parse(search.substring(1));
  }
  if (extend) {
    _.extend(currentParams, params);
  }
  const baseUrl = `${location.origin}${location.pathname}`;
  if (_.isEmpty(currentParams)) {
    return baseUrl;
  }
  return `${baseUrl}?${qs.stringify(currentParams)}`;
}
