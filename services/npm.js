const _ = require('lodash');
const npmApis = require('npm-apis');
const moment = require('moment');

const Models = localRequire('models');
const errors = localRequire('errors');

/**
 * Update the information of module
 * @param {String} name
 */
exports.update = async (name) => {
  const basic = await npmApis.get(name);
  if (!basic) {
    throw errors.get(301);
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


/**
 * Update the download information of module
 * @param {String} name The module's name
 */
exports.updateDownloads = async (name) => {
  const NPM = Models.get('Npm');
  const Download = Models.get('Download');
  const doc = await NPM.findOne({
    name,
  }, 'createdTime');
  if (!doc) {
    throw errors.get(301);
  }
  const downloadInfo = await Download.findOne({
    name,
  }).sort({
    date: -1,
  }).exec();
  const start = _.get(downloadInfo, 'date', doc.createdTime.substring(0, 10));
  const end = moment().add(-1, 'day').format('YYYY-MM-DD');
  if (start >= end) {
    return;
  }
  const downloads = await npmApis.getDownloads(name, start, end);
  const result = _.map(downloads, (item) => {
    const date = item.day;
    return {
      date,
      count: item.downloads,
      name,
    };
  });
  await Promise.each(result, (item) => {
    const query = {
      name: item.name,
      date: item.date,
    };
    return Download.findOneAndUpdate(query, item, {
      upsert: true,
    });
  });
  const docs = await Download.find({
    name,
    date: {
      $gte: moment().add(-90, 'day').format('YYYY-MM-DD'),
    },
  }, 'count date');
  const downloadsUpdate = {
    latest: 0,
    week: 0,
    month: 0,
    quarter: 0,
  };
  const dateDict = {
    latest: moment().add(-1, 'day').format('YYYY-MM-DD'),
    week: moment().add(-7, 'day').format('YYYY-MM-DD'),
    month: moment().add(-30, 'day').format('YYYY-MM-DD'),
    quarter: moment().add(-90, 'day').format('YYYY-MM-DD'),
  };
  _.forEach(docs, (item) => {
    _.forEach(dateDict, (date, type) => {
      if (item.date >= date) {
        downloadsUpdate[type] += item.count;
      }
    });
  });
  await NPM.findOneAndUpdate({
    name,
  }, {
    $set: {
      downloads: downloadsUpdate,
    },
  });
};

/**
 * Update the module list
 * @param {any} names
 */
exports.updateModules = async (names) => {
  const doUpdate = name => exports.update(name)
    .then(() => {
      console.info(`update ${name} success`);
    })
    .catch(err => console.error(`update ${name} fail, ${err.message}`));
  await Promise.map(names, doUpdate, {
    concurrency: 10,
  });
};

/**
 * Update the download of modules
 */
exports.updateModulesDownloads = async () => {
  const NPM = Models.get('Npm');
  const count = await NPM.count({});
  const offset = 10;
  const arr = _.range(0, _.ceil(count / offset));
  const update = async (start) => {
    const docs = await NPM.find({}, 'name')
      .skip(start)
      .limit(offset);
    const doDownloadUpdate = name => exports.updateDownloads(name)
      .then(() => console.info(`update ${name} downloads success`))
      .catch(err => console.error(`update ${name} downloads fail, ${err.message}`));
    return Promise.map(docs, item => doDownloadUpdate(item.name), {
      concurrency: 10,
    });
  };
  await Promise.each(arr, update);
};

/**
 * Get the query for npm model
 * @param {any} condition
 * @returns
 */
exports.query = (condition) => {
  const NPM = Models.get('Npm');
  return NPM.find(condition);
};
