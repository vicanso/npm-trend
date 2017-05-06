import _ from 'lodash';
import Promise from 'bluebird';
import {
  Line,
} from 'dcharts';

import * as npmService from '../services/npm';


export default class Trends {
  constructor(target, modules) {
    this.target = target;
    this.modules = modules;
    this.options = {
      days: 30,
    };
  }
  showChart(data) {
    const {
      target,
      modules,
    } = this;
    target.html('<svg />');
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
      <p class="tac">
        <i class="fa fa-spinner mright5" aria-hidden="true"></i>
        Loading...
      </p>
    `;
    target.html(loadingHtml);
    const fns = _.map(modules, module => npmService.getDownloads(module, days));
    Promise.all(fns)
      .then(data => this.showChart(data))
      .catch(() => target.find('p').text('Loading fail'));
  }
}
