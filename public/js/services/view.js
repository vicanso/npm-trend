import * as http from '../helpers/http';

export function get(url, selector = 'body') {
  const query = {
    selector,
  };
  return http.get(url, query).then(res => res.body);
}

export function count(url) {
  console.info(`${url} view visit`);
}
