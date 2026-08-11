const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent same user registering twice for the same event
registrationSchema.index({ event: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);