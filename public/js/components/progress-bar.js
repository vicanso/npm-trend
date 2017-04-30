import $ from 'jquery';
import _ from 'lodash';

export default class ProgressBar {
  constructor(options) {
    this.options = _.extend({
      duration: 3,
    }, options);
  }
  render(seconds = 3) {
    if (this.bar) {
      return _.noop;
    }
    this.bar = $('<div class="progressBar" />').appendTo('body');
    const start = Date.now();
    const ms = seconds * 1000;
    const loop = () => setTimeout(() => {
      const {
        bar,
      } = this;
      if (!bar) {
        return;
      }
      const percent = (100 * (Date.now() - start)) / ms;
      if (percent > 80) {
        return;
      }
      bar.width(`${percent}%`);
      loop();
    }, _.random(30, 300));
    loop();
    return () => {
      this.bar.remove();
    };
  }
}
