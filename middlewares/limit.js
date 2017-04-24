/**
 * 对系统做限制配置的中间件
 * @module middlewares/limit
 */
const limit = require('koa-connection-limit');

const globals = localRequire('helpers/globals');

/**
 * 设置不同的connectiong数量级别，不同的连接数对应不同的状态。
 * 使用koa-connection-limit，根据当前连接数，当状态变化时，触发回调函数。
 * 当系统状态达到`high`时，设置系统`status`为`pause`。当连接数降低，不再是`high`时，
 * 延时`interval`将系统重置为`running`
 * @param  {Object} options {mid: Integer, high: Integer}
 * @param  {Integer} interval 重置延时间隔
 * @return {Function} 返回中间件处理函数
 * @see {@link https://github.com/vicanso/koa-connection-limit|GitHub}
 */
module.exports = (options, interval) => {
  let connectionLimitTimer;
  return limit(options, (status) => {
    console.info(`connection-limit status:${status}`);
    globals.set('performance.concurrency', status);
    if (status === 'high') {
      // 如果并发处理数已到达high值，设置状态为 pause，此时ping请求返回error，反向代理(nginx, haproxy)认为此程序有问题，不再转发请求到此程序
      globals.set('status', 'pause');
      /* istanbul ignore if */
      if (connectionLimitTimer) {
        clearTimeout(connectionLimitTimer);
        connectionLimitTimer = null;
      }
    } else if (globals.get('status') !== 'running') {
      // 状态为low或者mid时，延时interval ms将服务设置回running
      connectionLimitTimer = setTimeout(() => {
        globals.set('status', 'running');
        connectionLimitTimer = null;
      }, interval);
      connectionLimitTimer.unref();
    }
  });
};
