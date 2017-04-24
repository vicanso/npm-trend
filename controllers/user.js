/**
 * 此模块主要是用户相关的处理
 * @module controllers/user
 */
const Joi = require('joi');
const _ = require('lodash');

const errors = localRequire('helpers/errors');
const userService = localRequire('services/user');
const config = localRequire('config');
const {
  randomToken,
} = localRequire('helpers/utils');

/**
 * 从用户信息中选择字段返回给前端使用，避免直接返回时把不应该展示的字段也返回了
 * @param  {Object} userInfos 用户数据
 * @return {Object} 筛选的数据 {
 * account: String,
 * lastLoginedAt: ISOString,
 * loginCount: Integer,
 * token: String,
 * date: ISOString,
 * }
 */
const pickUserInfo = (userInfos) => {
  const keys = 'account lastLoginedAt loginCount token'.split(' ');
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
 * 如果是GET，则返回一个随机的token，记录入到session中，用于用户密码hash使用
 * @param {Method} GET
 * @prop {Middlware} session
 * @prop {Route} /api/users/login
 * @return {Object} {token: String}
 */
exports.loginToken = (ctx) => {
  const session = ctx.session;
  if (_.get(session, 'user.account')) {
    throw errors.get(101);
  }
  const user = {
    token: randomToken(),
  };
  session.user = user;
  ctx.set('Cache-Control', 'no-store');
  /* eslint no-param-reassign:0 */
  ctx.body = user;
};

/**
 * 如果是POST，则是用户登录，并将用户信息记录到session中
 * @param {Method} POST
 * @param {String} request.body.account 用户账号
 * @param {String} request.body.password 用户密码
 * @prop {Middlware} session
 * @prop {Route} /api/users/login
 * @return {Object} 返回`pickUserInfo`的数据
 */
exports.login = async (ctx) => {
  const session = ctx.session;
  if (_.get(session, 'user.account')) {
    throw errors.get(101);
  }
  const token = _.get(session, 'user.token');
  if (!token) {
    throw errors.get(102);
  }
  const { account, password } = ctx.request.body;
  const doc = await userService.get(account, password, token);
  const user = pickUserInfo(doc);
  const ip = ctx.ip;
  user.token = randomToken();
  user.loginCount += 1;
  /* eslint no-param-reassign:0 */
  ctx.session.user = user;
  /* eslint no-param-reassign:0 */
  ctx.body = user;
  /* eslint no-underscore-dangle:0 */
  userService.update(doc._id, {
    lastLoginedAt: (new Date()).toISOString(),
    loginCount: user.loginCount,
    ip,
  });
  userService.addLoginRecord({
    account: user.account,
    token: user.token,
    userAgent: ctx.get('User-Agent'),
    ip,
  });
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
 * 用户注册
 * @param {Method} POST
 * @param {String} request.body.account 用户账号，Joi.string().min(4).required()
 * @param {String} request.body.password 用户密码，Joi.string().required()
 * @param {String} request.body.email 用户邮箱，Joi.string().email().required()
 * @prop {Middleware} session
 * @prop {Route} /api/users/register
 * @return {Object} 从用户信息中返回pickUserInfo函数获取的值
 */
exports.register = async (ctx) => {
  const data = Joi.validateThrow(ctx.request.body, {
    account: Joi.string().min(4).required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  if (_.get(ctx, 'session.user.account')) {
    throw errors.get(103);
  }
  const ip = ctx.ip;
  data.ip = ip;
  const doc = await userService.add(data);
  doc.token = randomToken();
  const user = pickUserInfo(doc);
  /* eslint no-param-reassign:0 */
  ctx.session.user = user;
  /* eslint no-param-reassign:0 */
  ctx.body = user;
  userService.addLoginRecord({
    account: user.account,
    token: user.token,
    userAgent: ctx.get('User-Agent'),
    ip,
  });
};

/**
 * 用户Like
 * @param {Method} POST
 * @param {String} request.body.code 用户Like的编码
 * @prop {Middleware} level(5)
 * @prop {Middleware} version([2, 3])
 * @prop {Middleware} session.read
 * @return {Object} 返回用户Like的信息
 */
exports.like = (ctx) => {
  const {
    version,
    type,
  } = ctx.versionConfig;
  if (version < 3) {
    ctx.set('Warning', 'Version less than 3 is deprecated.');
  }
  /* eslint no-param-reassign:0 */
  ctx.body = {
    count: 10,
    version,
    type,
  };
};
