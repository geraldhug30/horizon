const mongoose = require('mongoose');

const HorizonSchema = mongoose.Schema(
  {
    posted: {
      type: Boolean,
      default: false,
    },
    updateBody: {
      type: String,
      trim: true,
      require: true,
      validate(value) {
        if (!value) {
          throw new Error('no value added');
        }
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
  },
  {
    timestamps: true,
  }
);
const HorizonUpdates = mongoose.model('horizon', HorizonSchema);
module.exports = HorizonUpdates;
