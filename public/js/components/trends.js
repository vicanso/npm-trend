import _ from 'lodash';
import $ from 'jquery';
import {
  Line,
} from 'dcharts';


const DAY_LIST = [7, 14, 28, 91, 182, 364];

export default class Trends {
  constructor(target, options) {
    this.target = $('<div class="trends-chart" />').appendTo(target);
    this.options = _.extend({
      days: DAY_LIST[2],
    }, options);
    this.initEvent();
  }
  initEvent() {
    const {
      target,
    } = this;
    target.on('click', '.days-selector a', (e) => {
      const obj = $(e.currentTarget);
      const days = parseInt(obj.text(), 10);
      this.options.days = days;
      this.render();
    });
  }
  showChart(data) {
    const {
      target,
    } = this;
    const {
      title,
    } = this.options;
    const currentDays = this.options.days;
    target.html('<svg />');
    const daysList = _.map(DAY_LIST, (days) => {
      let cls = '';
      if (currentDays === days) {
        cls = 'selected';
      }
      return `<a href="javascript:;" class="${cls}">
        ${days}
      </a>`;
    });
    target.append(`
      <div class="days-selector">
        ${daysList.join('')}
      </div>
    `);
    target.append(`
      <div class="copyright">
        npmtrend.com
      </div>
    `);
    const chart = new Line(target.find('svg').get(0));
    chart.set('yAxis.width', 40);
    chart.set('xAxis.categories', data.categories);
    chart.set('title.text', title || 'Trends');
    chart.render(data.data);
  }
  render() {
    const {
      target,
    } = this;
    const {
      days,
      getData,
    } = this.options;
    const loadingHtml = `
      <div class="loading">
        <i class="fa fa-spinner mright5" aria-hidden="true"></i>Loading...
      </div>
    `;
    target.html(loadingHtml);
    let interval = 1;
    if (days > 100) {
      interval = 7;
    }
    getData(days, interval).then(data => this.showChart(data))
      .catch(() => target.find('.loading').text('Loading fail'));
  }
}
