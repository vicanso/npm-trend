/**
 * 此模块主要是用户相关的处理
 * @module controllers/user
 */
const Joi = require('joi');
const _ = require('lodash');
const request = require('superagent');

const errors = localRequire('helpers/errors');
const userService = localRequire('services/user');
const config = localRequire('config');
const {
  randomToken,
} = localRequire('helpers/utils');
const influx = localRequire('helpers/influx');
const locationService = localRequire('services/location');

/**
 * 从用户信息中选择字段返回给前端使用，避免直接返回时把不应该展示的字段也返回了
 * @param  {Object} userInfos 用户数据
 * @return {Object} 筛选的数据
 */
const pickUserInfo = (userInfos) => {
  const keys = 'name avatar account type'.split(' ');
  return _.extend({
    date: new Date().toISOString(),
  }, _.pick(userInfos, keys));
};

/**
 * 从session获取当前登录用户的信息
 * @param {Method} GET
 * @prop {Middlware} noCache
 * @prop {Middlware} session.read
 * @prop {Route} /api/users/me
 * @return {Object} 用户信息，如果未登录，只有date字段，如果已登录返回`pickUserInfo`的数据
 */
exports.me = (ctx) => {
  /* eslint no-param-reassign:0 */
  ctx.body = pickUserInfo(ctx.session.user || {});
};

/**
 * 退出用户登录状态，并删除session信息
 * @param {Method} DELETE
 * @prop {Middlware} session
 * @prop {Route} /api/users/logout
 * @return {Object} 成功则返回null
 */
exports.logout = (ctx) => {
  delete ctx.session.user;
  /* eslint no-param-reassign:0 */
  ctx.body = null;
};


/**
 * 刷新用户session的ttl
 * @param {Method} PUT
 * @prop {Middleware} session
 * @prop {Route} /api/users/me
 * @return {Object} 刷新成功则返回null
 */
exports.refreshSession = async (ctx) => {
  const {
    ttl,
    maxAge,
  } = config.session;
  await ctx.refreshSessionTTL(ttl);
  const cookies = ctx.cookies;
  const name = config.app;
  cookies.set(name, cookies.get(name), {
    maxAge,
  });
  ctx.body = null;
};


/**
 * 用户行为记录
 * @param {Method} POST
 * @prop {Middleware} session
 * @return
 */
exports.behavior = (ctx) => {
  const account = _.get(ctx, 'session.user.account');
  _.forEach(ctx.request.body, (item) => {
    const type = item.type;
    delete item.type;
    if (account) {
      item.account = account;
    }
    influx.write('behavior', item, {
      type,
    });
  });
  ctx.status = 201;
};

exports.loginCallback = async (ctx) => {
  const params = Joi.validateThrow(ctx.query, {
    code: Joi.string().max(24),
    type: Joi.string().valid(['github']),
    'redirect-uri': Joi.string().default('/'),
  });
  let res = await request.post('https://github.com/login/oauth/access_token')
    .set('Accept', 'application/json')
    .send({
      client_id: '04e3e64ca25edf31751e',
      client_secret: 'c37548b36fc69739f3dd5a9dffea89ee7cbfc895',
      code: params.code,
    });
  const accessToken = res.body.access_token;
  if (!accessToken) {
    throw errors.get(108);
  }

  res = await request.get(`https://api.github.com/user?access_token=${accessToken}`);
  const userInfos = res.body;
  const user = {
    token: randomToken(),
    accessToken,
    name: userInfos.name,
    avatar: userInfos.avatar_url,
    account: userInfos.login,
    type: params.type,
  };
  ctx.session.user = user;
  const ip = ctx.ip;
  userService.addLoginRecord({
    account: user.account,
    type: user.type,
    token: user.token,
    userAgent: ctx.get('User-Agent'),
    ip,
  });
  locationService.byIP(ip).then((data) => {
    const fields = _.extend({
      ip,
    }, data);
    influx.write('login', fields);
  }).catch(err => console.error(`Get location by ip(${ip}) fail, ${err.message}`));
  ctx.redirect(params['redirect-uri']);
};

exports.star = async (ctx) => {
  const user = ctx.session.user;
  const data = Joi.validateThrow(ctx.params, {
    module: Joi.string().max(50),
  });
  const options = {
    account: user.account,
    type: user.type,
    module: data.module,
  };
  if (ctx.method === 'DELETE') {
    await userService.removeStar(options);
    ctx.status = 204;
  } else {
    await userService.star(options);
    if (ctx.method === 'POST') {
      ctx.status = 201;
    } else {
      ctx.status = 204;
    }
  }
};

exports.getStars = async (ctx) => {
  const user = ctx.session.user;
  ctx.body = await userService.getStars(user
  .account, user.type);
};
