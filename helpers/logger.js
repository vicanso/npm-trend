/**
 * 初始化logger对象（自动对console做替换）
 */
const Logger = require('timtam-logger');

const configs = localRequire('config');


if (configs.logger) {
  const logger = new Logger({
    app: configs.app,
  });
  logger.before(configs.name);
  logger.wrap(console);
  logger.add(configs.logger);
  'emerg alert crit'.split(' ').forEach((event) => {
    logger.on(event, (message) => {
      console.dir(message);
      // TODO 发送email警报
    });
  });
  module.exports = logger;
} else {
  console.emerg = console.error;
  console.alert = console.error;
  console.crit = console.error;
  module.exports = console;
}
