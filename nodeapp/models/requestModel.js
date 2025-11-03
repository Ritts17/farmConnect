const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['Feed', 'Medicine'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  itemName: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // livestockId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Livestock',
  //   required: true
  // },
  livestockName : {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);