const _ = require('lodash');

const errors = localRequire('helpers/errors');
const request = localRequire('helpers/request');

exports.byIP = (ip) => {
  const url = 'http://ip.taobao.com/service/getIpInfo.php';
  return request.get(url)
    .set('Accept', 'application/json')
    .query({
      ip,
    })
    .then((res) => {
      try {
        const info = JSON.parse(res.text);
        if (info.code !== 0) {
          throw errors.get(7);
        }
        return _.pick(info.data, ['country', 'region', 'city', 'isp']);
      } catch (err) {
        console.error(`parse ip info fail, ${err.message}`);
        throw errors.get(7);
      }
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
