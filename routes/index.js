const requireTree = require('require-tree');
const _ = require('lodash');

module.exports = _.flatten(_.values(requireTree('.')));
