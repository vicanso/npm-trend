import $ from 'jquery';
import _ from 'lodash';

import * as globals from '../helpers/globals';
import ToolTip from '../components/tooltip';
import ProgressBar from '../components/progress-bar';
import {
  getUrl,
  getQueryParam,
} from '../helpers/utils';
import * as viewService from '../services/view';

const viewWrapper = $('.home-view');

function initDownloadTip() {
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

function refreshView(url) {
  const selector = '.modules-wrapper';
  const progress = new ProgressBar();
  const end = progress.render();
  viewService.get(url, selector).then((data) => {
    $(selector, viewWrapper).html(data.content);
    end();
  }).catch((err) => {
    console.error(err.message);
    end();
  });
}

function initFilter() {
  const history = globals.get('history');
  const setFilterSelected = (wrapper) => {
    const filterKeys = [
      getQueryParam('sort') || 'downloads.latest',
    ].sort();
    const filters = wrapper.find('a');
    _.forEach(filters, (item) => {
      const obj = $(item);
      const key = obj.data('key');
      if (_.sortedIndexOf(filterKeys, key) !== -1) {
        obj.addClass('selected');
      } else {
        obj.removeClass('selected');
      }
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
    const parent = target.closest('ul');
    parent.find('a.selected').removeClass('selected');
    target.addClass('selected');
    const type = parent.data('type');
    const params = {};
    params[type] = target.data('key');
    const url = getUrl(params);
    history.pushState(null, '', url);
    refreshView(url);
    toggleFilter();
  });
}


initDownloadTip();
initFilter();
