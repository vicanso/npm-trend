const mongoose = require('mongoose');

const {
  String,
  Boolean,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    account: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    latest: {
      version: String,
      time: String,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  indexes: [
    {
      account: 1,
      type: 1,
    },
  ],
};
