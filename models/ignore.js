const mongoose = require('mongoose');

const {
  String,
} = mongoose.Schema.Types;

module.exports = {
  schema: {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  indexes: [
    {
      name: 1,
    },
  ],
};
