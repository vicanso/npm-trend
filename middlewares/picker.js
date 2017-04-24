/**
 * 此模块用于由前端指定返回数据中筛选字段
 * @module middlewares/picker
 */

const _ = require('lodash');

/**
 * 根据设置的field字段生成picker中间件
 * @param  {String} field 在querystring中哪个属性是标记筛选字段，在此使用的是_fields
 * @return {Function} 返回中间件处理函数
 */
module.exports = field => (ctx, next) => {
  const query = ctx.query;
  let pickValue = query[field];
  if (pickValue) {
    // 将query参数删除，避免影响后面函数的参数判断（请求的参数判断都尽量使用强制匹配，因为参数多一个也不行）
    delete query[field];
    /* eslint no-param-reassign:0 */
    ctx.query = query;
  }
  return next().then(() => {
    if (!pickValue || !ctx.body) {
      return;
    }
    let pickFn = _.pick;
    if (pickValue[0] === '-') {
      pickFn = _.omit;
      pickValue = pickValue.substring(1);
    }
    const keys = pickValue.split(',');
    const fn = item => pickFn(item, keys);
    if (_.isArray(ctx.body)) {
      /* eslint no-param-reassign:0 */
      ctx.body = _.map(ctx.body, fn);
    } else {
      /* eslint no-param-reassign:0 */
      ctx.body = fn(ctx.body);
    }
  });
};
