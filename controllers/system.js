/**
 * 此模块主要是一些公共与业务无关的处理
 * @module controllers/system
 */


const BlueBird = require('bluebird');
const path = require('path');
const moment = require('moment');
const _ = require('lodash');

const fs = BlueBird.promisifyAll(require('fs'));

const config = localRequire('config');
const globals = localRequire('helpers/globals');
const utils = localRequire('helpers/utils');

/**
 * 获取系统当前运行的版本package.json与读取文件package.json的版本号，
 * 正常情况下两者一致，但是如果更新了版本，但是没有重启就会不一致
 * @return {Object} 返回版本号信息 {code: 读取文件的版本号, exec: 内部中加载的版本号}
 */
async function getVersion() {
  const buf = await fs.readFileAsync(path.join(__dirname, '../package.json'));
  const pkg = JSON.parse(buf);
  return {
    code: pkg.version,
    exec: config.version,
  };
}

/**
 * 获取系统运行与代码的版本号，调用`getVersion`函数获取
 * @param {Method} GET
 * @prop {Middleware} noQuery
 * @prop {Route} /api/sys/version
 * @return {Object} {code: 读取文件的版本号, exec: 内部中加载的版本号}
 */
exports.version = async (ctx) => {
  const version = await getVersion();
  ctx.setCache(600);
  /* eslint no-param-reassign:0 */
  ctx.body = version;
};

/**
 * 设置系统状态为`pause`，此时系统对于`/ping`的响应会返回出错，
 * 主要用于可以让前置的反向代理不再往当前系统转发请求，用于graceful shutdown之类
 * @param {Method} POST
 * @param {Header} Auth-Token 认证TOEKN
 * @prop {Middleware} auth.admin 验证token是否admin
 * @prop {Route} /api/sys/pause
 * @return {Object} 如果成功，返回null
 */
exports.pause = (ctx) => {
  globals.set('status', 'pause');
  console.info('pause application');
  ctx.body = null;
};

/**
 * 重置系统状态为`running`，此时系统对于`/ping`的响应会正常返回
 * @param {Method} POST
 * @param {Header} Auth-Token 认证TOEKN
 * @prop {Middleware} auth.admin 验证token是否admin
 * @prop {Route} /api/sys/resume
 * @return {Object} 如果成功，返回null
 */
exports.resume = (ctx) => {
  globals.set('status', 'running');
  console.info('resume application');
  ctx.body = null;
};

/**
 * 获取当前系统的状态，包括当前连接数，系统状态，版本，运行时长等
 * @param {Method} GET
 * @prop {Middleware} noQuery
 * @prop {Route} /api/sys/status
 * @return {Object} {
 * connectingTotal: Integer,
 * status: String,
 * version: Object,
 * uptime: String,
 * startedAt: ISOString,
 * }
 */
exports.status = async (ctx) => {
  const version = await getVersion();
  const uptime = moment(Date.now() - (Math.ceil(process.uptime()) * 1000));
  ctx.body = {
    connectingTotal: globals.get('connectingTotal'),
    status: globals.get('status'),
    version,
    uptime: uptime.fromNow(),
    startedAt: uptime.toISOString(),
  };
};

/**
 * 使用`uitls.checkToExit(3)，此函数只是退出当前应用，如果有守护进程之类可用于graceful reload`
 * @param {Method} POST
 * @param {Header} Auth-Token 认证TOEKN
 * @prop {Middleware} auth.admin
 * @prop {Route} /api/sys/exit
 * @return {Object} 如果成功，返回null
 */
exports.exit = (ctx) => {
  utils.checkToExit(3);
  console.info('application will exit soon');
  ctx.body = null;
};

/**
 * 设置当前系统的`level`级别，部分路由的处理会设置低于某个`level`时，直接返回出错
 * @param {Method} POST
 * @param {Header} Auth-Token 认证TOEKN
 * @prop {Middleware} auth.admin
 * @prop {Route} /api/sys/level
 * @return {Object} 如果成功，返回null
 */
exports.setLevel = (ctx) => {
  const level = _.get(ctx, 'request.body.level');
  if (level) {
    globals.set('level', level);
  }
  ctx.body = null;
};

/**
 * 获取当前系统的`level`级别
 * @param {Method} GET
 * @prop {Middleware} noCache
 * @prop {Route} /api/sys/level
 * @return {Object} {level: Integer}
 */
exports.level = (ctx) => {
  ctx.body = {
    level: globals.get('level'),
  };
};
