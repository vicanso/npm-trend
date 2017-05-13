const moment = require('moment');
const _ = require('lodash');
const Joi = require('joi');

const npmService = localRequire('services/npm');

exports.get = async (ctx) => {
  const options = Joi.validateThrow(ctx.query, {
    offset: Joi.number().integer().default(0),
    limit: Joi.number().integer().min(1).max(1000)
      .default(20),
  });
  const docs = await npmService.query({})
    .select('name')
    .skip(options.offset)
    .limit(options.limit);
  ctx.set(600);
  ctx.body = _.map(docs, item => item.name);
};

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
  ctx.setCache('10m');
  ctx.body = {
    count,
  };
};

exports.getDownloads = async (ctx) => {
  const formatStr = 'YYYY-MM-DD';
  const params = Joi.validateThrow(ctx.query, {
    begin: Joi.date().min(moment().add(-1, 'year').format(formatStr)),
    end: Joi.date().max(moment().format(formatStr))
      .default(moment().add(-1, 'day').format(formatStr)),
  });
  const name = ctx.params.name;
  const begin = moment(params.begin).format(formatStr);
  const end = moment(params.end).format(formatStr);
  const data = await npmService.getDownloads(name, begin, end);
  ctx.setCache('10m');
  ctx.body = data;
};
