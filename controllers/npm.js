const moment = require('moment');

const npmService = localRequire('services/npm');

exports.update = async (ctx) => {
  await npmService.update(ctx.params.name);
  ctx.body = null;
};

exports.updateDownloads = async (ctx) => {
  await npmService.updateDownloads(ctx.params.name);
  ctx.body = null;
};

exports.count = async (ctx) => {
  const options = ctx.query;
  const conditions = {};
  const getTime = (value) => {
    const date = moment()
      .add(parseInt(value, 10), 'day')
      .format('YYYY-MM-DD');
    return `${date}T00:00:00.000Z`;
  };
  if (options.created) {
    conditions.createdTime = {
      $gte: getTime(options.created),
    };
  }
  if (options.updated) {
    conditions['latest.time'] = {
      $gte: getTime(options.updated),
    };
  }
  if (options.author) {
    conditions['author.name'] = options.author;
  }
  if (options.keyword) {
    conditions.keywords = options.keyword;
  }
  if (options.q) {
    conditions.name = new RegExp(options.q);
  }
  const count = await npmService.count(conditions);
  ctx.setCache(600);
  ctx.body = {
    count,
  };
};
