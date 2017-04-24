import React, { Component } from 'react';
import * as _ from 'lodash';

import * as userService from '../services/user';

class APIView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          name: 'Like(v1 removal)',
          fn: () => userService.like({
            code: '520',
          }, 1),
        },
        {
          name: 'Like(v2 deprecate)',
          fn: () => userService.like({
            code: '520',
          }, 2),
        },
        {
          name: 'Like(v3 latest)',
          fn: () => userService.like({
            code: '520',
          }, 3),
        },
      ],
    };
  }
  render() {
    const {
      items,
      status,
      response,
    } = this.state;
    const list = _.map(items, (item, i) => (
      <li
        key={i}
      >
        <a
          href="/api/{i}"
          onClick={(e) => {
            e.preventDefault();
            this.setState({
              status: 'fetching',
            });
            item.fn().then((data) => {
              this.setState({
                status: 'success',
                response: data,
              });
            }).catch((err) => {
              this.setState({
                status: 'fail',
                response: err.response.body,
              });
            });
          }}
        >
          {item.name}
        </a>
      </li>
    ));
    let result = '';
    switch (status) {
      case 'fetching':
        result = 'Fetching, please hold on...';
        break;
      case 'success':
        result = 'Fetch data success';
        break;
      case 'fail':
        result = 'Fetch data fail';
        break;
      default:
        result = '';
        break;
    }
    return (
      <div className="api-view">
        <ul>
          { list }
        </ul>
        <div className="preview">
          <p className="tac">{result}</p>
          <pre className="response">
            { JSON.stringify(response, null, 2) }
          </pre>
        </div>
      </div>
    );
  }
}

export default APIView;
