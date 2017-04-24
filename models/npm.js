const mongoose = require('mongoose');

const {
  Object,
  String,
  Array,
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
      required: true,
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
  },
  indexes: [
    {
      name: 1,
    },
    {
      'latest.time': 1,
    },
  ],
};
