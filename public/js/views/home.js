import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';

import ToolTip from '../components/tooltip';
import ProgressBar from '../components/progress-bar';
import {
  alert,
} from '../components/dialog';
import Trends from '../components/trends';
import {
  getUrl,
  getQueryParam,
  getQueryParams,
  getErrorMessage,
} from '../helpers/utils';
import * as globals from '../helpers/globals';
import * as viewService from '../services/view';
import * as locationService from '../services/location';
import * as npmService from '../services/npm';
import * as userService from '../services/user';
import {
  VIEW_HOME,
} from '../constants/urls';

let viewWrapper;
const starList = [];

function showMyStars() {
  const html = `<div class="stars-wrapper">
    <div class="content-wrapper">
      <h4>
        <a href="javascript:;" class="close pull-right tac">
          <i class="fa fa-times" aria-hidden="true"></i>
        </a>
        My Stars
      </h4>
      <div class="content">
        <p class="tac">Loading</p>
      </div>
    </div>
  </div>`;
  const starsWrapper = $(html).appendTo(viewWrapper);
  starsWrapper.find('a.close').click(() => {
    starsWrapper.remove();
  });
  userService.getStars().then((data) => {
    const arr = _.map(data, (item) => {
      const downloads = _.get(item, 'downloads.latest', 0);
      const tr = `<tr>
        <td>${item.name}</td>
        <td>${item.latest.version}</td>
        <td>${downloads.toLocaleString()}</td>
        <td>${moment(item.latest.time).format('YYYY-MM-DD HH:mm')}</td>
        <td title="Updated after star">
          <i class="fa fa-refresh" aria-hidden="true"></i>
          ${item.latest.time > item.starVersion.time}
        </td>
      </tr>`;
      return tr;
    });
    const tableHtml = `<table>
      <thead>
        <th>Name</th>
        <th>Latest</th>
        <th>Downloads</th>
        <th>UpdatedAt</th>
        <th>Updated</th>
      </thead>
      <tbody>
        ${arr.join('')}
      </tbody>
    </table>`;
    starsWrapper.find('.content').html(tableHtml);
    const height = starsWrapper.find('.content-wrapper').height();
    starsWrapper.css('margin-top', -(height / 2));
  }).catch(err => starsWrapper.find('p').text(getErrorMessage(err)));
}

function initUserHandle() {
  $('.header-wrapper .functions .user', viewWrapper).click(() => {
    $('.header-wrapper .user-functions', viewWrapper).removeClass('hidden');
  }).blur(() => {
    const obj = $('.header-wrapper .user-functions', viewWrapper);
    obj.css('opacity', 0);
    _.delay(() => {
      obj.addClass('hidden').css('opacity', 1);
    }, 500);
  });

  $('.header-wrapper .user-functions .logout', viewWrapper).click(() => {
    userService.logout();
  });
  $('.header-wrapper .user-functions .my-stars', viewWrapper).click(showMyStars);


  const staring = {};
  viewWrapper.on('click', '.modules-wrapper a.star', (e) => {
    const target = $(e.currentTarget);
    const name = target.siblings('.module').text();
    if (staring[name]) {
      return;
    }
    let fn = 'addStar';
    if (target.hasClass('selected')) {
      fn = 'removeStar';
    }
    staring[name] = true;
    userService[fn](name)
      .then(() => {
        delete staring[name];
        target.toggleClass('selected');
      })
      .catch((err) => {
        delete staring[name];
        alert(getErrorMessage(err));
      });
  });
}

function addStarStatus(target) {
  const list = $('li a.module', target);
  _.forEach(list, (item) => {
    const obj = $(item);
    if (_.indexOf(starList, obj.text()) !== -1) {
      obj.siblings('.star').addClass('selected');
    }
  });
}

// set the click event for about tips
function initAboutTipHandle() {
  let tooltip;
  $('.modules-wrapper', viewWrapper).on('click', '.tips', (e) => {
    if (tooltip) {
      tooltip.destroy();
      const currentTarget = tooltip.target;
      tooltip = null;
      if (currentTarget === e.currentTarget) {
        return;
      }
    }
    tooltip = new ToolTip(e.currentTarget, {
      left: '20%',
      className: 'module-about-tip',
    });
    tooltip.render();
  });
}

// get the module list view
function getView(url, selector) {
  const progress = new ProgressBar();
  const end = progress.render();
  return viewService.get(url, selector).then((data) => {
    end();
    return data;
  }).catch((err) => {
    end();
    throw err;
  });
}

// set the filter event
function initFilterHandle() {
  const setFilterSelected = (wrapper) => {
    const filterKeys = {
      sort: getQueryParam('sort') || 'downloads.latest',
      updated: getQueryParam('updated') || '',
      created: getQueryParam('created') || '',
    };
    _.forEach(wrapper.find('ul'), (list) => {
      const liObj = $(list);
      const type = liObj.data('type');
      _.forEach(liObj.find('a'), (item) => {
        const obj = $(item);
        if (filterKeys[type] === obj.data('key')) {
          obj.addClass('selected');
        } else {
          obj.removeClass('selected');
        }
      });
    });
  };
  let isShowFilter = false;
  const toggleFilter = () => {
    const wrapper = $('.filter-wrapper', viewWrapper);
    const filterBtn = $('.functions .filter', viewWrapper);
    wrapper.toggleClass('hidden');
    filterBtn.toggleClass('selected');
    isShowFilter = !isShowFilter;
    if (isShowFilter) {
      setFilterSelected(wrapper);
    }
  };

  // toggle filter
  $('.functions .filter', viewWrapper).click(toggleFilter);
  $('.filter-wrapper', viewWrapper).on('click', 'a', (e) => {
    const target = $(e.currentTarget);
    if (target.hasClass('selected')) {
      return;
    }
    let url = '';
    if (target.hasClass('reset')) {
      url = getUrl({}, false);
    } else {
      const parent = target.closest('ul');
      parent.find('a.selected').removeClass('selected');
      target.addClass('selected');
      const type = parent.data('type');
      const params = {};
      params[type] = target.data('key');
      url = getUrl(params);
    }
    locationService.push(url);
    toggleFilter();
  });
}


const getMoreOptions = {
  isGettingMore: false,
  offset: 0,
  pageSize: 20,
  max: 0,
};
// get more modules and append to the bottom
function getMore() {
  const {
    isGettingMore,
    offset,
    pageSize,
    max,
  } = getMoreOptions;
  if (isGettingMore || (offset + pageSize) >= max) {
    return;
  }
  getMoreOptions.isGettingMore = true;
  const selector = '.modules-wrapper';
  const url = getUrl({
    offset: offset + pageSize,
  });
  const item = $(selector, viewWrapper);
  const loading = $(`
    <div class="loading tac">
      <i class="fa fa-spinner mright5" aria-hidden="true"></i>
      Getting more modules...
    </div>
  `).appendTo(item);
  getView(url, selector)
    .then((viewData) => {
      getMoreOptions.isGettingMore = false;
      getMoreOptions.offset += pageSize;
      loading.remove();
      const list = $(viewData.content);
      item.append(list);
      addStarStatus(list);
      if (getMoreOptions.offset + pageSize > max) {
        item.append(`
          <div style="margin:20px;text-align:center">
            <i class="fa fa-stop mright5" aria-hidden="true"></i>
            Ended
          </div>
        `);
      }
    }).catch((err) => {
      getMoreOptions.isGettingMore = false;
      loading.remove();
      alert(getErrorMessage(err) || 'Load data fail');
    });
}

// init the scroll event for get more modules
function initScrollHandle() {
  const doc = $(globals.get('document'));
  const windowHeight = $(globals.get('self')).height();
  const offset = 200;
  doc.on('scroll', _.debounce(() => {
    if (doc.scrollTop() + windowHeight + offset > $('body').height()) {
      getMore();
    }
  }));
}

// init the keyword, author fitler handle
function initAnchorClickHandle() {
  viewWrapper.on('click', '.keywords a, a.author', (e) => {
    const target = $(e.currentTarget);
    locationService.push(target.prop('href'));
    e.preventDefault();
  });
}

function initSearchHandle() {
  const inputFilter = '.search-component input';
  const doSearch = () => {
    const q = viewWrapper.find(inputFilter).val().trim();
    const params = {};
    if (q) {
      params.q = q;
    }
    locationService.push(getUrl(params, false));
  };
  viewWrapper.on('click', '.search-component .search', doSearch);
  viewWrapper.on('keyup', inputFilter, (e) => {
    if (e.keyCode === 0x0d) {
      doSearch();
    }
  });
  viewWrapper.on('click', '.search-component .clear', () => {
    viewWrapper.find(inputFilter).val('');
  });
}

function initDownloadTrendHandle() {
  viewWrapper.on('click', '.modules-wrapper a.download-trend', (e) => {
    const target = $(e.currentTarget);
    const moduleItem = target.closest('li');
    if (target.hasClass('selected')) {
      target.removeClass('selected');
      moduleItem.find('.chart-wrapper').remove();
      return;
    }
    target.addClass('selected');
    const name = target.siblings('.module').text();
    const chartWrapper = $('<div class="chart-wrapper" />')
      .appendTo(moduleItem);
    const trends = new Trends(chartWrapper, [
      name,
    ]);
    trends.render();
  });
}

// show the count of modules
function appendCountTips() {
  const keys = [
    'created',
    'updated',
    'author',
    'keyword',
    'q',
  ];
  const params = _.pick(getQueryParams(), keys);
  const countObj = $('.modules-count-wrapper .count', viewWrapper);
  countObj.text('--');
  npmService.count(params).then((count) => {
    getMoreOptions.max = count;
    countObj.text(count.toLocaleString());
  });
}

function initCompareHandle() {
  const renderCompareList = () => {
    const modules = npmService.getCompareList();
    let compareWrapper = viewWrapper.find('.compare-wrapper');
    if (!modules || !modules.length) {
      compareWrapper.remove();
      return;
    }
    if (!compareWrapper.length) {
      compareWrapper = $(`<div class="compare-wrapper">
        <h4>
          <a class="pull-right close" href="javascript:;">
            <i class="fa fa-times" aria-hidden="true"></i>
          </a>
          Compare modules
        </h4>
        <ul></ul>
        <div class="functions">
          <a href="javascript:;">Start</a>
          <a href="javascript:;" class="clear">Clear</a>
        </div>
      `).appendTo(viewWrapper);
    }
    const list = _.map(modules, module => `<li>
      ${module}
      <a href="javascript:;" title="remove from compare">
        <i class="fa fa-chain-broken" aria-hidden="true"></i>
      </a>
    `);
    compareWrapper.find('ul').html(list.join(''));
  };

  viewWrapper.on('click', '.modules-wrapper a.compare', (e) => {
    const target = $(e.currentTarget);
    target.addClass('selected');
    const name = target.siblings('.module').text();
    npmService.addToCompare(name);
    renderCompareList();
  });
  viewWrapper.on('click', '.compare-wrapper li a', (e) => {
    const name = $(e.currentTarget).closest('li').text().trim();
    npmService.removeFromCompare(name);
    renderCompareList();
  });
  viewWrapper.on('click', '.compare-wrapper .functions a', (e) => {
    const target = $(e.currentTarget);
    const compareWrapper = viewWrapper.find('.compare-wrapper');
    if (target.hasClass('clear')) {
      npmService.clearCompare();
      compareWrapper.remove();
      return;
    }
    compareWrapper.find('.compare-chart-wrapper').remove();
    const chartWrapper = $('<div class="compare-chart-wrapper" />')
      .appendTo(compareWrapper);
    const trends = new Trends(chartWrapper, npmService.getCompareList());
    trends.render();
  });
  viewWrapper.on('click', '.compare-wrapper .close', () => {
    viewWrapper.find('.compare-wrapper').remove();
  });
  renderCompareList();
}

locationService.on('change', (data) => {
  if (data.path !== VIEW_HOME) {
    return;
  }
  getMoreOptions.offset = 0;
  if (data.prevPath !== data.path) {
    viewWrapper = $('.home-view');
    initAboutTipHandle();
    initFilterHandle();
    initScrollHandle();
    initAnchorClickHandle();
    initSearchHandle();
    initDownloadTrendHandle();
    initCompareHandle();
    initUserHandle();
  } else {
    const selector = '.modules-wrapper';
    const item = $(selector, viewWrapper);
    getView(data.url, selector)
      .then((viewData) => {
        item.html(viewData.content);
        addStarStatus(viewWrapper.find('.modules-wrapper ul'));
      })
      .catch(err => alert(err.message));
  }
  appendCountTips();
  // set search q
  const q = getQueryParam('q');
  if (q) {
    $('.search-component input', viewWrapper).val(q);
  }
});

userService.on('session', (userInfo) => {
  const loginBtn = $('.header-wrapper .functions .login', viewWrapper);
  const userAvatar = $('.header-wrapper .functions .user', viewWrapper);
  if (!userInfo || !userInfo.account) {
    loginBtn.removeClass('hidden');
    userAvatar.addClass('hidden');
    starList.length = 0;
  } else {
    loginBtn.addClass('hidden');
    userAvatar.removeClass('hidden').html(`<img src="${userInfo.avatar}" />`);
    userService.getStars().then((data) => {
      const modules = _.map(data, item => item.name);
      starList.push(...modules);
      addStarStatus(viewWrapper.find('.modules-wrapper ul'));
    });
  }
});
