const request = require('superagent');
const _ = require('lodash');

const errors = localRequire('helpers/errors');
const config = localRequire('config');

exports.byIP = (ip) => {
  const url = 'https://dm-81.data.aliyun.com/rest/160601/ip/getIpInfo.json';
  return request.get(url)
    .set('Authorization', `APPCODE ${config.ipAPPCode}`)
    .set('Accept', 'application/json')
    .query({
      ip,
    })
    .then((res) => {
      if (res.body.code !== 0) {
        throw errors.get(7);
      }
      return _.pick(res.body.data, ['country', 'region', 'city', 'isp']);
    });
};

exports.byMobile = (mobile) => {
  const complete = (res) => {
    const reg = new RegExp(`${mobile}：(\\S+)\\s(\\S+)`, 'gi');
    const result = reg.exec(res.text);
    /* istanbul ignore if */
    if (!result || result.length < 2) {
      return null;
    }
    return {
      province: result[1],
      city: result[2],
    };
  };
  return request.post('http://ws.webxml.com.cn/WebServices/MobileCodeWS.asmx/getMobileCodeInfo')
    .send({
      mobileCode: mobile,
      userID: '',
    })
    .type('form')
    .then(complete);
};
