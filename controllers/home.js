/**
 * @module controllers/home
 */

const npmService = localRequire('services/npm');
const Joi = require('joi');
const moment = require('moment');
const _ = require('lodash');

/**
 * 根据template，生成html，主要是网页是单页应用但是需要刷新时能加载到html
 * @param {Method} GET
 * @prop {Route} /
 * @prop {Route} /login
 * @prop {Route} /register
 * @prop {Template} home
 * @return {String} 返回render的html
 * @example
 * curl 'http://host/login'
 */
module.exports = async (ctx) => {
  const timing = ctx.state.timing;
  const sorts = {
    'downloads.latest': 'Downloads(latest day)',
    'downloads.week': 'Downloads(7 days)',
    'downloads.month': 'Downloads(30 days)',
    'downloads.quarter': 'Downloads(90 days)',
    dependedCount: 'The depended count',
    'latest.time': 'Time of latest version',
    createdTime: 'Time of create',
  };
  const sortKeys = _.keys(sorts);
  const options = Joi.validateThrow(ctx.query, {
    sort: Joi.string()
      .valid(sortKeys)
      .default(_.first(sortKeys)),
    sortBy: Joi.string().valid('desc', 'asc').default('desc'),
    offset: Joi.number().integer().default(0),
    keyword: Joi.string().max(20).optional(),
    q: Joi.string().max(20).optional(),
    author: Joi.string().max(40).optional(),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    created: Joi.string()
      .valid('-1d', '-7d', '-30d', '-90d', '-180d', '-360d'),
    updated: Joi.string()
      .valid('-1d', '-7d', '-30d', '-90d', '-180d', '-360d'),
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
  if (options.author) {
    conditions['author.name'] = options.author;
  }
  if (options.keyword) {
    conditions.keywords = options.keyword;
  }
  if (options.q) {
    conditions.name = new RegExp(options.q);
  }
  const queryEnd = timing.start('mongodbQuery');
  const result = await npmService.query(conditions)
    .select('-readme -versions -maintainers')
    .sort(sort)
    .skip(options.offset)
    .limit(options.limit);
  queryEnd();
  const docs = [];
  _.forEach(result, (doc) => {
    const item = doc.toJSON();
    if (item.name !== options.q) {
      docs.push(item);
    }
  });
  // get the name match the q
  if (options.offset === 0 && options.q) {
    const matchModule = await npmService.get(options.q);
    if (matchModule) {
      docs.unshift(matchModule);
    }
  }
  const modules = _.map(docs, (doc) => {
    const module = doc;
    const publishedTimeList = _.map(module.publishedTime, (item) => {
      const {
        version,
        time,
      } = item;
      return `<li>
        <span class="version">${version}</span>
        <span class="time">${moment(time).format('YYYY-MM-DD')}</span>
       </i>`;
    });
    let versionTips = 'there is only one major version.';
    if (publishedTimeList.length > 0) {
      versionTips = `there are ${publishedTimeList.length} major versions.`;
    }
    module.about = `The module is created at <span class="created-time">${moment(module.createdTime).format('YYYY-MM-DD')}</span>, ${versionTips} The latest published time of each version:
      <ul class="published-time-list">
        ${publishedTimeList.reverse().join('')}
      </ul>
    `;
    return module;
  });
  ctx.setCache('10m');
  const dateFilters = {
    '-1d': 'Last 1 day',
    '-7d': 'Last 7 days',
    '-30d': 'Last 30 days',
    '-90d': 'Last 90 days',
    '-180d': 'Last 180 days',
    '-360d': 'Last 360 days',
  };
  _.extend(ctx.state, {
    title: 'The modules you want',
    viewData: {
      sorts,
      updatedAt: dateFilters,
      createdAt: dateFilters,
      modules,
      query: ctx.query,
    },
  });
};
