const _ = require('lodash');

const viewConfigs = [
  // name tempalte
  'home home',
];
const template = localRequire('middlewares/template');
_.forEach(viewConfigs, (config) => {
  const arr = config.split(' ');
  exports[arr[0]] = template.parse(arr[1]);
});
