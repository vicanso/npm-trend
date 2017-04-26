const schedule = require('node-schedule');
const npmApis = require('npm-apis');
const _ = require('lodash');

const npmService = localRequire('services/npm');
localRequire('tasks/performance')(10 * 1000);
localRequire('tasks/backend')(300 * 1000);

function getAll() {
  return new Promise((resolve, reject) => {
    require('fs').readFile('/Users/xieshuzhou/Downloads/all.json', (err, buf) => {
      if (err) {
        return reject(err);
      }
      const modules = [];
      const data = JSON.parse(buf);
      _.forEach(data, (pkg, key) => {
        if (key === '_updated') {
          return;
        }
        if (!pkg.time || !pkg.time.modified) {
          return;
        }
        modules.push(pkg.name);
      });
      return resolve(modules);
    });
  });  
}

function getDependeds() {
  return new Promise((resolve, reject) => {
    require('fs').readFile('/Users/xieshuzhou/Downloads/depended.json', (err, buf) => {
      if (err) {
        return reject(err);
      }
      const arr = [];
      _.forEach(JSON.parse(buf).rows, (item) => {
        const name = item.key[0].trim();
        if (name) {
          arr.push({
            name,
            count: item.value,
          });
        }
      });
      return resolve(arr);
    });
  });
}

async function updateModules(modules) {
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
    console.info('update module downloads success');
  } catch (err) {
    console.error(`update module downloads fail, ${err.message}`);
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
  schedule.scheduleJob('45 22 * * *', updateModules);
  schedule.scheduleJob('00 01 * * *', updateModulesDownloads);
  schedule.scheduleJob('00 02 * * *', updateDependeds);
}

// updateDependeds();
// updateModules();
