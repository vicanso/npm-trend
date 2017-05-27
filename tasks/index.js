const schedule = require('node-schedule');
const npmApis = require('npm-apis');

const request = localRequire('helpers/request');
const npmService = localRequire('services/npm');
localRequire('tasks/performance')(10 * 1000);
localRequire('tasks/backend')(300 * 1000);

async function updateAllModules() {
  try {
    console.info('start to update modules');
    const modules = await npmApis.getAll();
    if (!modules.length) {
      console.error('the moudles is empty, will try again later');
      setTimeout(async () => {
        updateAllModules();
      }, 60 * 1000);
      return;
    }
    await npmService.updateModules(modules);
    console.info('update modules success');
  } catch (err) {
    console.error(`update modules fail, ${err.message}`);
  }
}

async function updateYesterdayMoudles() {
  try {
    console.info('start to update yesterday modules');
    const modules = await npmApis.getYesterdayUpdates();
    await npmService.updateModules(modules, true);
    console.info('update yesterday modules success');
  } catch (err) {
    console.error(`update yesterday modules fail, ${err.message}`);
  }
}


async function updateModulesDownloads() {
  try {
    request.disable('stats');
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

async function udpateCreatedAndUpdatedCount() {
  try {
    console.info('start to update created and updated count');
    await npmService.udpateCreatedAndUpdatedCount();
    console.info('start to update created and updated count');
  } catch (err) {
    console.error(`update created and update count fail, ${err.message}`);
  }
}

if (process.env.ENABLE_JOB) {
  schedule.scheduleJob('00 01 * * *', udpateCreatedAndUpdatedCount);
  schedule.scheduleJob('00 02 * * *', updateYesterdayMoudles);
  schedule.scheduleJob('00 03 * * *', updateDependeds);
  schedule.scheduleJob('00 04 * * *', updateAllModules);
  schedule.scheduleJob('00 15 * * *', updateModulesDownloads);
}
if (process.env.DO_NOW) {
  const doTask = process.env.DO_NOW;
  switch (doTask) {
    case 'updateAllModules':
      updateAllModules();
      break;
    case 'updateModulesDownloads':
      updateModulesDownloads();
      break;
    default:
      break;
  }
}
