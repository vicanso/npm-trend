import $ from 'jquery';
import _ from 'lodash';

import ToolTip from '../components/tooltip';

function initDownloadTip() {
  const domList = $('.home-view .modules-wrapper .tips');
  _.forEach(domList, (dom) => {
    const tooltip = new ToolTip(dom, {
      left: '20%',
      className: 'module-about-tip',
    });
    tooltip.render();
  });
}


initDownloadTip();
