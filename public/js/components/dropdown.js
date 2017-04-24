import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';

class Dropdown extends Component {
  renderItems() {
    const {
      items,
      onSelect,
    } = this.props;
    const fn = onSelect;
    return _.map(items, (item, index) => {
      const type = item.type || 'item';
      const defaultItemCls = {};
      defaultItemCls[type] = true;
      const itemCls = _.extend(defaultItemCls, item.cls);
      switch (type) {
        case 'divider':
          return (
            <div
              key={index}
              className={classnames(itemCls)}
            />
          );
        case 'label':
          return (
            <div
              key={index}
              className={classnames(itemCls)}
              title={item.title}
            >
              {item.name}
            </div>
          );
        default:
          return (
            <a
              key={index}
              className={classnames(itemCls)}
              href={item.href}
              title={item.title}
              onClick={e => fn(e, item)}
            >{item.name}</a>
          );
      }
    });
  }
  render() {
    const {
      cls,
    } = this.props;
    const defaultCls = {
      dropdown: true,
    };
    return (
      <div className={classnames(_.extend(defaultCls, cls))}>
        {
          this.renderItems()
        }
      </div>
    );
  }
}

Dropdown.defaultProps = {
  cls: {},
  onSelect: _.noop,
};

Dropdown.propTypes = {
  items: PropTypes.array.isRequired,
  cls: PropTypes.object,
  onSelect: PropTypes.func,
};

export default Dropdown;
