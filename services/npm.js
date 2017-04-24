const _ = require('lodash');
const npmApis = require('npm-apis');

const Models = localRequire('models');


exports.update = async (name) => {
  const basic = await npmApis.get(name);
  if (!basic) {
    throw new Error(`Can't get the module:${name}`);
  }
  let latestVersion;
  const versions = [];
  _.forEach(basic.time, (time, version) => {
    if (!latestVersion || latestVersion.time < time) {
      latestVersion = {
        version,
        time,
      };
    }
    versions.push({
      version,
      time,
    });
  });
  delete basic.time;
  delete basic.latest;
  basic.versions = _.sortBy(versions, item => item.time);
  basic.latest = latestVersion;
  const scores = await npmApis.getScore(name);
  // scores 有可能为空
  basic.scores = scores;
  const NPM = Models.get('Npm');
  await NPM.findOneAndUpdate({
    name,
  }, basic, {
    upsert: true,
  });
};


exports.updateDownloads = async (name, start, end) => {
  const downloads = await npmApis.getDownloads(name, start, end);
  return _.map(downloads, (item) => {
    const date = item.day;
    return {
      date,
      count: item.downloads,
      name,
    };
  });
};
