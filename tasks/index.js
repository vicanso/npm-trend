const schedule = require('node-schedule');
const npmApis = require('npm-apis');

const npmService = localRequire('services/npm');
localRequire('tasks/performance')(10 * 1000);
localRequire('tasks/backend')(300 * 1000);

schedule.scheduleJob('00 00 00 * *', async () => {
  try {
    const modules = await npmApis.getAll();
    await npmService.updateModule(modules);
    console.info('update modules success');
  } catch (err) {
    console.error(`update modules fail, ${err.message}`);
  }
});

schedule.scheduleJob('00 00 01 * *', async () => {
  try {
    await npmService.updateModulesDownloads();
    console.info('update module downloads success');
  } catch (err) {
    console.error(`update module downloads fail, ${err.message}`);
  }
});

