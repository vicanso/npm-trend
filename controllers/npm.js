const Joi = require('joi');
const moment = require('moment');
const _ = require('lodash');

const npmService = localRequire('services/npm');

exports.update = async (ctx) => {
  await npmService.update(ctx.params.name);
  ctx.body = null;
};

exports.updateDownloads = async (ctx) => {
  await npmService.updateDownloads(ctx.params.name);
  ctx.body = null;
};

exports.get = async (ctx) => {
  const sortKeys = [
    'downloads.latest',
    'downloads.week',
    'downloads.month',
    'downloads.quarter',
    'latest.time',
    'createdTime',
  ];
  const options = Joi.validateThrow(ctx.query, {
    sort: Joi.string()
      .valid(sortKeys)
      .default(_.first(sortKeys)),
    sortBy: Joi.string().valid('desc', 'asc').default('desc'),
    offset: Joi.number().integer().default(0),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    created: Joi.string()
      .valid('-7d', '-30d', '-91d'),
    updated: Joi.string()
      .valid('-7d', '-30d', '-91d'),
  });
  const sort = {};
  sort[options.sort] = options.sortBy === 'desc' ? -1 : 1;
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
  const docs = await npmService.query(conditions)
    .select('-readme -versions -maintainers')
    .sort(sort)
    .skip(options.offset)
    .limit(options.limit);
  ctx.setCache(600);
  ctx.body = _.map(docs, item => item.toJSON());
};
