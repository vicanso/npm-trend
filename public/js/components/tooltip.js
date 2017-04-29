import $ from 'jquery';
import _ from 'lodash';


export default class ToolTip {
  constructor(target, options) {
    this.target = $(target);
    this.options = _.extend({
      left: '50%',
    }, options);
  }
  render() {
    const {
      target,
    } = this;
    const {
      left,
      className,
    } = this.options;
    const tip = $(`<div class="tooltip">
      <div class="arrow-up-shadow"></div>
      <div class="arrow-up"></div>
      <div class="content">
        ${target.data('content')}
      </div>
    </div>`);
    if (className) {
      tip.addClass(className);
    }
    target.on('mouseenter', () => {
      const offset = target.offset();
      tip.appendTo('body');
      tip.find('.arrow-up, .arrow-up-shadow').css('left', left);
      const percent = parseFloat(left);
      offset.left -= (tip.outerWidth() * (percent / 100));
      offset.top += 20;
      tip.offset(offset);
    }).on('mouseleave', () => {
      tip.remove();
    });
  }
}
