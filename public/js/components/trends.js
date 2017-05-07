import _ from 'lodash';
import Promise from 'bluebird';
import $ from 'jquery';
import {
  Line,
} from 'dcharts';

import * as npmService from '../services/npm';


export default class Trends {
  constructor(target, modules) {
    this.target = $('<div class="trends-chart" />').appendTo(target);
    this.modules = modules;
    this.options = {
      days: 30,
    };
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
      modules,
    } = this;
    const currentDays = this.options.days;
    target.html('<svg />');
    const daysList = _.map([7, 14, 30, 90, 180], (days) => {
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
    const categories = [];
    const chartData = _.map(data, (arr, index) => {
      const series = {
        name: modules[index],
      };
      series.data = _.map(arr, (item) => {
        if (index === 0) {
          categories.push(item.date);
        }
        return item.count;
      });
      return series;
    });
    const chart = new Line(target.find('svg').get(0));
    chart.set('curve', ['curveCatmullRom.alpha', 0.5]);
    chart.set('yAxis.width', 40);
    chart.set('xAxis.categories', categories);
    chart.set('title.text', 'The trend of downloads');
    chart.render(chartData);
  }
  render() {
    const {
      target,
      modules,
    } = this;
    const {
      days,
    } = this.options;
    const loadingHtml = `
      <div class="loading">
        <i class="fa fa-spinner mright5" aria-hidden="true"></i>Loading...
      </div>
    `;
    target.html(loadingHtml);
    const fns = _.map(modules, module => npmService.getDownloads(module, days));
    Promise.all(fns)
      .then(data => this.showChart(data))
      .catch(() => target.find('.loading').text('Loading fail'));
  }
}
