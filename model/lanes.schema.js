const mongoose = require('mongoose');


const lanesSchema = new mongoose.Schema({
    laneId: {
        required: true,
        type: String
    },
    cost: {
        required: true,
        type: Number,
        default: 100
      },
    booked: {
        required: true,
        type: Boolean
    },
})



module.exports = mongoose.model('lanes', lanesSchema);