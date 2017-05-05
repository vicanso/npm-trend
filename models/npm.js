const mongoose = require('mongoose');

const {
  Object,
  String,
  Number,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    readme: String,
    maintainers: [Object],
    author: {
      type: Object,
      required: true,
    },
    keywords: [String],
    license: String,
    versions: [Object],
    createdTime: {
      type: String,
      required: true,
    },
    publishedTime: {
      type: Object,
      required: true,
    },
    latest: {
      version: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
    scores: Object,
    downloads: {
      latest: Number,
      week: Number,
      month: Number,
      quarter: Number,
    },
    dependeds: {
      latest: Number,
      week: Number,
      month: Number,
      quarter: Number,
    },
    dependedCount: Number,
  },
  indexes: [
    {
      name: 1,
    },
    {
      createdTime: 1,
    },
    {
      keywords: 1,
    },
    {
      'latest.time': 1,
    },
    {
      'downloads.latest': 1,
    },
    {
      'downloads.week': 1,
    },
    {
      'downloads.month': 1,
    },
    {
      'downloads.quarter': 1,
    },
    {
      'dependeds.latest': 1,
    },
    {
      'dependeds.week': 1,
    },
    {
      'dependeds.month': 1,
    },
    {
      'dependeds.quarter': 1,
    },
  ],
};
