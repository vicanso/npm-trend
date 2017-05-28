const mongoose = require('mongoose');

const {
  String,
  Number,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    created: {
      type: Number,
    },
    updated: {
      type: Number,
    },
  },
  indexes: [
    {
      date: 1,
    },
  ],
};
