const mongoose = require('mongoose');

const {
  Number,
  String,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    date: {
      type: String,
      required: true,
    },
    downloads: {
      type: Number,
    },
    dependeds: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
    },
  },
  indexes: [
    {
      name: 1,
    },
    {
      name: 1,
      date: 1,
    },
  ],
};
