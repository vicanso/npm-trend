import Promise from 'bluebird';
/* eslint import/first:0*/
window.Promise = Promise;

import * as _ from 'lodash';
import $ from 'jquery';

import * as globals from './helpers/globals';
import * as statsService from './services/stats';
import * as http from './helpers/http';
import * as locationService from './services/location';
import * as userService from './services/user';

import './views/home';

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
  // TODO imporove performance stats
  // const performance = globals.get('performance');
  // if (performance) {
  //   data.performance = performance.timing;
  //   if (performance.getEntries) {
  //     const entries = performance.getEntries();
  //     data.entries = _.filter(entries, tmp => tmp.initiatorType !== 'xmlhttprequest');
  //   }
  // }
  statsService.statistics(data)
    .then(() => console.info('post statistics success'))
    .catch(err => console.error('post statistics fail, %s', err));
}

function initScroll() {
  const anchor = $(`
    <a href="javascript:;" class="scroll-top hidden">
      <i class="fa fa-chevron-up" aria-hidden="true"></i>
    </a>
  `);
  anchor.appendTo('body');
  const doc = $(globals.get('document'));
  let isHidden = true;
  doc.on('scroll', _.throttle(() => {
    if (doc.scrollTop() > 500) {
      if (isHidden) {
        anchor.removeClass('hidden');
      }
      isHidden = false;
    } else if (!isHidden) {
      anchor.addClass('hidden');
      isHidden = true;
    }
  }, 500));
  anchor.click(() => {
    $('html, body').animate({
      scrollTop: 0,
    });
  });
}

locationService.subscribe(() => userService.addBehavior('pv'));

_.defer(() => {
  globarErrorCatch();
  statistics();
  // set global http request timeout
  http.timeout(10 * 1000);
  initScroll();
  userService.visit();
  userService.me();
});
