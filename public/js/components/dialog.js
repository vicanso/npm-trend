import $ from 'jquery';
import _ from 'lodash';

export default class Dialog {
  constructor(options) {
    this.options = _.extend({
      autoRemove: true,
      title: 'Prompt',
      delay: 1500,
      mask: true,
    }, options);
  }
  render(content) {
    const {
      title,
      mask,
      autoRemove,
      delay,
    } = this.options;
    if (mask) {
      this.mask = $('<div class="mask" />').appendTo('body');
    }
    const dlg = $(`
      <div class="dialog">
        <h4>${title}</h4>
        <div class="content">
          ${content}
        </div>
      </div>
    `);
    dlg.appendTo('body');
    dlg.css('margin-top', -(dlg.outerHeight() / 2));
    this.dlg = dlg;
    if (autoRemove) {
      setTimeout(() => {
        this.destroy();
      }, delay);
    }
  }
  destroy() {
    const {
      dlg,
      mask,
    } = this;
    dlg.remove();
    if (mask) {
      mask.remove();
    }
  }
}


export function alert(content) {
  const dlg = new Dialog({
    title: 'Warning',
  });
  dlg.render(content);
}
