import * as _ from 'lodash';

export function get(path, defaultValue) {
  /* eslint no-undef:0 */
  return _.get(window, path, defaultValue);
}

export function set(path, value) {
  /* eslint no-undef:0 */
  _.set(window, path, value);
}
