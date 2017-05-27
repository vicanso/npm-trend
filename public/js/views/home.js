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
const destroyList = [];

function showMyStars() {
  let updatedCount = 0;
  const arr = _.map(userService.getState().star.modules, (item) => {
    const downloads = _.get(item, 'downloads.latest', 0);
    let gotCls = 'got';
    if (item.latest.time > item.starVersion.time) {
      gotCls += ' active';
      updatedCount += 1;
    }
    const tr = `<tr>
      <td>${item.name}</td>
      <td>${item.latest.version}</td>
      <td>${downloads.toLocaleString()}</td>
      <td>${moment(item.latest.time).format('YYYY-MM-DD HH:mm')}</td>
      <td>
        <a href="javascript:;" class="${gotCls}" title="Updated after star">
          <i class="fa fa-check" aria-hidden="true"></i> Got
        </a>
        <a href="javascript:;" class="unstar">
          <i class="fa fa-star-half-o" aria-hidden="true"></i> Unstar
        </a>
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
      <th>OP</th>
    </thead>
    <tbody>
      ${arr.join('')}
    </tbody>
  </table>`;
  const html = `<div class="stars-wrapper">
    <div class="content-wrapper">
      <h4>
        <a href="javascript:;" class="close pull-right tac">
          <i class="fa fa-times" aria-hidden="true"></i>
        </a>
        My Stars(${updatedCount} module has been update after star)
      </h4>
      <div class="content">
        ${tableHtml}
      </div>
    </div>
  </div>`;
  const starsWrapper = $(html).appendTo(viewWrapper);
  const contentWrapper = starsWrapper.find('.content-wrapper');
  contentWrapper.css('margin-top', -(contentWrapper.height() / 2));
  starsWrapper.find('a.close').click(() => {
    starsWrapper.remove();
  });
  starsWrapper.on('click', '.unstar, .got.active', (e) => {
    const target = $(e.currentTarget);
    const tr = target.closest('tr');
    const name = tr.find('td:first').text();
    const type = target.hasClass('got') ? 'update' : 'remove';
    const fn = type === 'update' ? 'updateStar' : 'removeStar';
    userService[fn](name).then(() => {
      if (type === 'remove') {
        tr.remove();
        return;
      }
      target.removeClass('active');
    });
  });
}

function addStarStatus(target) {
  const list = $('li a.module', target);
  const starList = _.map(userService.getState().star.modules, item => item.name);
  _.forEach(list, (item) => {
    const obj = $(item);
    const star = obj.siblings('.star');
    if (_.indexOf(starList, obj.text()) !== -1) {
      star.addClass('selected');
    } else {
      star.removeClass('selected');
    }
  });
}

function initUserHandle(wrapper) {
  const loginSelector = '.header-wrapper .functions .login';
  const logoutSelector = '.header-wrapper .user-functions .logout';
  const userSelector = '.header-wrapper .functions .user';
  const functionsSelector = '.header-wrapper .user-functions';
  const myStarsSelector = '.header-wrapper .user-functions .my-stars';

  $(userSelector, wrapper).click(() => {
    $(functionsSelector, wrapper).toggleClass('hidden');
  }).blur(() => {
    const obj = $(functionsSelector, wrapper);
    obj.css('opacity', 0);
    _.delay(() => {
      obj.addClass('hidden').css('opacity', 1);
    }, 500);
  });

  $(functionsSelector, wrapper).click(() => {
    $(functionsSelector, wrapper).addClass('hidden');
  });

  $(logoutSelector, wrapper).click(() => {
    userService.logout();
  });
  $(myStarsSelector, wrapper).click(showMyStars);

  $('.header-wrapper .user-functions .npm-trends', wrapper).click(() => {
    const chartWrapper = $('<div class="npm-trends-wrapper" />')
      .appendTo(wrapper);
    const mask = $('<div class="mask-wrapper" />')
      .appendTo('body')
      .click(() => {
        chartWrapper.remove();
        mask.remove();
      });
    const trends = new Trends(chartWrapper, {
      title: 'NPM Statistics',
      getData: (days, interval) => npmService.getNPMStatsChartData(days, interval),
    });
    trends.render();
  });

  const staring = {};
  wrapper.on('click', '.modules-wrapper a.star', (e) => {
    const target = $(e.currentTarget);
    const name = target.siblings('.module').text();
    if (staring[name]) {
      return;
    }
    let fn = 'addStar';
    if (target.hasClass('selected')) {
      fn = 'removeStar';
    }
    const faItem = target.find('.fa');
    faItem.addClass('fa-spinner');
    staring[name] = true;
    userService[fn](name)
      .then(() => {
        faItem.removeClass('fa-spinner');
        delete staring[name];
      })
      .catch((err) => {
        faItem.removeClass('fa-spinner');
        delete staring[name];
        alert(getErrorMessage(err));
      });
  });

  const changeLoginStatus = (userInfo) => {
    const loginBtn = $(loginSelector, wrapper);
    const userAvatar = $(userSelector, wrapper);
    if (!userInfo || !userInfo.account) {
      loginBtn.removeClass('hidden');
      userAvatar.addClass('hidden');
    } else {
      loginBtn.addClass('hidden');
      userAvatar.removeClass('hidden')
      .html(`<img src="${userInfo.avatar}" />`);
    }
  };

  const showUpdateCount = (stars) => {
    const userAvatar = $(userSelector, wrapper);
    let updatedCount = 0;
    _.forEach(stars, (item) => {
      if (item.latest.time > item.starVersion.time) {
        updatedCount += 1;
      }
    });
    const countObj = $(myStarsSelector, wrapper).find('.count');
    if (updatedCount) {
      userAvatar.append('<div class="dot" />');
      if (countObj.length) {
        countObj.text(updatedCount);
      } else {
        $(myStarsSelector, wrapper)
          .append(`<span class="count">${updatedCount}</span>`);
      }
    } else {
      userAvatar.find('.dot').remove();
      countObj.remove();
    }
  };

  let userToken = '';
  let starToken = '';
  const unsubscribe = userService.subscribe(() => {
    const state = userService.getState();
    if (userToken !== state.token) {
      changeLoginStatus(state.basic);
      if (state.basic.account) {
        userService.getStars();
      }
    }
    if (state.star && starToken !== state.star.token) {
      showUpdateCount(state.star.modules);
      addStarStatus($('.modules-wrapper', wrapper));
    }
    userToken = state.token;
    starToken = state.star.token;
  });
  destroyList.push(unsubscribe);
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
      sort: getQueryParam('sort') || '',
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
    let url = '';
    if (target.hasClass('reset')) {
      url = getUrl({}, false);
    } else {
      const parent = target.closest('ul');
      const type = parent.data('type');
      const params = {
        offset: null,
      };
      if (target.hasClass('selected')) {
        target.removeClass('selected');
        params[type] = null;
      } else {
        parent.find('a.selected').removeClass('selected');
        target.addClass('selected');
        params[type] = target.data('key');
      }
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
  end: false,
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
      const newUrl = getUrl({
        offset: getMoreOptions.offset,
      });
      locationService.push(newUrl, '', false);
      if (getMoreOptions.offset + pageSize > max) {
        getMoreOptions.end = true;
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
    if (getMoreOptions.end || getMoreOptions.isGettingMore) {
      return;
    }
    if (doc.scrollTop() + windowHeight + offset > $('body').height()) {
      getMore();
    }
  }, 500));
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
    viewWrapper.find(inputFilter).val('').focus();
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
    const modules = [
      name,
    ];
    const trends = new Trends(chartWrapper, {
      title: 'The trend of downloads',
      getData: (days, interval) => {
        const args = [
          modules,
          days,
          interval,
        ];
        return npmService.getDownloadsChartData(...args);
      },
    });
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
      $('.modules-wrapper .compare.selected', viewWrapper).removeClass('selected');
      return;
    }
    compareWrapper.find('.compare-chart-wrapper').remove();
    const chartWrapper = $('<div class="compare-chart-wrapper" />')
      .appendTo(compareWrapper);
    const modules = npmService.getCompareList();
    const trends = new Trends(chartWrapper, {
      title: 'The trend of downloads',
      getData: (days, interval) => {
        const args = [
          modules,
          days,
          interval,
        ];
        return npmService.getDownloadsChartData(...args);
      },
    });
    trends.render();
  });
  viewWrapper.on('click', '.compare-wrapper .close', () => {
    viewWrapper.find('.compare-wrapper').remove();
  });
  renderCompareList();
}

function destroy() {
  _.forEach(destroyList, fn => fn());
}


locationService.subscribe(() => {
  const data = locationService.getState();
  let currentPath = data.path;
  if (currentPath[currentPath.length - 1] !== '/') {
    currentPath += '/';
  }
  if (currentPath !== VIEW_HOME) {
    destroy();
    return;
  }
  getMoreOptions.offset = +(getQueryParam('offset') || 0);
  if (data.prevPath !== data.path) {
    viewWrapper = $('.home-view');
    initAboutTipHandle();
    initFilterHandle();
    initScrollHandle();
    initAnchorClickHandle();
    initSearchHandle();
    initDownloadTrendHandle();
    initCompareHandle();
    initUserHandle(viewWrapper);
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
