const schedule = require('node-schedule');
const _ = require('lodash');
const request = require('superagent');

const npmService = localRequire('services/npm');
localRequire('tasks/performance')(10 * 1000);
localRequire('tasks/backend')(300 * 1000);

function getAll() {
  return request.get('http://oidmt881u.bkt.clouddn.com/all.json')
    .then((res) => {
      const data = res.body;
      if (_.isEmpty(data)) {
        throw new Error('Get moudles fail, it\'s empty');
      }
      const modules = [];
      _.forEach(data, (pkg, key) => {
        if (key === '_updated') {
          return;
        }
        if (!pkg.time || !pkg.time.modified) {
          return;
        }
        modules.push(pkg.name);
      });
      return modules;
    });
}

function getDependeds() {
  return request.get('http://oidmt881u.bkt.clouddn.com/depended.json')
    .then((res) => {
      const arr = [];
      _.forEach(res.body.rows, (item) => {
        const name = item.key[0].trim();
        if (name) {
          arr.push({
            name,
            count: item.value,
          });
        }
      });
      return arr;
    });
}

async function updateModules() {
  try {
    console.info('start to update modules');
    // const modules = await npmApis.getAll();
    const modules = await getAll();
    await npmService.updateModules(modules);
    console.info('update modules success');
  } catch (err) {
    console.error(`update modules fail, ${err.message}`);
  }
}

async function updateModulesDownloads() {
  try {
    console.info('start to update modules downloads');
    await npmService.updateModulesDownloads();
    console.info('update modules downloads success');
  } catch (err) {
    console.error(`update modules downloads fail, ${err.message}`);
  }
}

async function updateDependeds() {
  try {
    console.info('start to update dependeds');
    const dependeds = await getDependeds();
    await npmService.updateMoudlesDependeds(dependeds);
    console.info('update dependeds success');
  } catch (err) {
    console.error(`update dependeds fail, ${err.message}`);
  }
}

if (process.env.ENABLE_JOB) {
  schedule.scheduleJob('00 00 * * *', updateModules);
  _.forEach([1, 9, 17], (value) => {
    const hours = value < 10 ? `0${value}` : `${value}`;
    schedule.scheduleJob(`00 ${hours} * * *`, updateModulesDownloads);
  });
  schedule.scheduleJob('00 03 * * *', updateDependeds);
  updateModules();
}
