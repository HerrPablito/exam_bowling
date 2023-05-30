const mongoose = require('mongoose');


const lanesSchema = new mongoose.Schema({
    laneId: {
      required: true,
      type: String,
    },
    cost: {
      required: true,
      type: Number,
      default: 100,
    },
    bookings: [
      {
        startTime: {
          required: true,
          type: Date,
        },
        endTime: {
          required: true,
          type: Date,
        },
      },
    ],
  });


module.exports = mongoose.model('Lane', lanesSchema);