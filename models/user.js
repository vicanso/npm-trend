const mongoose = require('mongoose');

const {
  String,
  Number,
} = mongoose.Schema.Types;

const {
  createValidateHook,
  createUpdateHook,
} = localRequire('helpers/hooks');

function afterValidate(doc) {
  console.info(`${doc.account} after validate`);
}

function get(conditions) {
  return this.find(conditions);
}

module.exports = {
  // model的schema定义
  schema: {
    account: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
    lastLoginedAt: {
      type: String,
      required: true,
    },
    loginCount: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  // model的index配置
  indexes: [
    {
      account: 1,
    },
  ],
  // mongoose pre hook
  pre: {
    validate: [
      createValidateHook({
        createdAt: 'date',
        updatedAt: 'date',
      }),
    ],
    findOneAndUpdate: [
      createUpdateHook({
        updatedAt: 'date',
      }),
    ],
  },
  // mongoose post hook
  post: {
    validate: [
      afterValidate,
    ],
  },
  // mongoose static function
  static: {
    get,
  },
};
