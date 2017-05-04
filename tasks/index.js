const schedule = require('node-schedule');
const _ = require('lodash');
const request = require('superagent');
const npmApis = require('npm-apis');

const npmService = localRequire('services/npm');
localRequire('tasks/performance')(10 * 1000);
localRequire('tasks/backend')(300 * 1000);


async function updateModules() {
  try {
    console.info('start to update modules');
    const modules = await npmApis.getAll();
    if (!modules.length) {
      return setTimeout(async () => {
        console.error('the moudles is empty, will try again later');
        updateModules();
      }, 5000);
    }
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
    const dependeds = await npmApis.getDependeds();
    await npmService.updateMoudlesDependeds(dependeds);
    console.info('update dependeds success');
  } catch (err) {
    console.error(`update dependeds fail, ${err.message}`);
  }
}

if (process.env.ENABLE_JOB) {
  // _.forEach([1, 9, 17], (value) => {
  //   const hours = value < 10 ? `0${value}` : `${value}`;
  //   schedule.scheduleJob(`00 ${hours} * * *`, updateModulesDownloads);
  // });
  // schedule.scheduleJob('00 03 * * *', updateDependeds);
  updateModules();
}
