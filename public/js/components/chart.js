import _ from 'lodash';
import {
  Line,
} from 'dcharts';

export default class Chart {
  constructor(target, options) {
    this.chart = new Line(target);
    this.options = _.extend({
      title: 'The trend of downloads',
    }, options);
  }
  render(categories, data) {
    const {
      chart,
    } = this;
    const {
      title,
    } = this.options;
    chart.set('curve', ['curveCatmullRom.alpha', 0.5]);
    chart.set('xAxis.categories', categories);
    chart.set('title.text', title);
    chart.render(data);
  }
}
