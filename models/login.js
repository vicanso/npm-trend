const mongoose = require('mongoose');

const {
  String,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    account: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  indexes: [
    {
      account: 1,
    },
    {
      createdAt: 1,
    },
    {
      account: 1,
      createdAt: 1,
    },
  ],
};
