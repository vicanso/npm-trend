import * as _ from 'lodash';
import jquery from 'jquery';

import * as globals from './helpers/globals';
import * as statsService from './services/stats';
import * as http from './helpers/http';

console.dir(jquery);

function globarErrorCatch() {
  globals.set('onerror', (msg, url, line, row, err) => {
    let stack = '';
    if (err) {
      stack = err.stack;
    }
    const data = {
      url,
      line,
      row,
      msg,
      stack,
      type: 'uncaughtException',
    };
    if (globals.get('CONFIG.env') === 'development') {
      /* eslint no-alert:0 no-undef:0 */
      alert(JSON.stringify(data));
    }
  });
}

function statistics() {
  const data = {
    screen: _.pick(globals.get('screen'), 'width height availWidth availHeight'.split(
      ' ')),
    template: globals.get('CONFIG.template'),
  };
  const timing = globals.get('TIMING');
  if (timing) {
    timing.end('page');
    data.timing = timing.toJSON();
  }

  const performance = globals.get('performance');
  if (performance) {
    data.performance = performance.timing;
    if (performance.getEntries) {
      const entries = performance.getEntries();
      data.entries = _.filter(entries, tmp => tmp.initiatorType !== 'xmlhttprequest');
    }
  }
  statsService.statistics(data)
    .then(() => console.info('post statistics success'))
    .catch(err => console.error('post statistics fail, %s', err));
}


_.defer(() => {
  globarErrorCatch();
  statistics();
  // set global http request timeout
  http.timeout(10 * 1000);
});
