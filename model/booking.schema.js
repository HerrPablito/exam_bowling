const mongoose = require('mongoose');
const moment = require('moment');
const uuid = require('uuid-random')


function formatBookingTime(year, month, day, hour) {
    const startTime = moment(`${year}-${month}-${day} ${hour}:00`, 'YYYY-M-D HH:mm');
    const endTime = startTime.clone().add(1, 'hour');
    const endHour = endTime.format('HH');

    return startTime.format('YYYY-MM-DD [kl:] HH [till kl: ]') + endHour;
  }

const bookingSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
    },
    timeToBowl: {
        required: true,
        type: String,
        set: function (timeObj) {
          return formatBookingTime(timeObj.year, timeObj.month, timeObj.day, timeObj.hour);
        },
      },
    numberOfPlayers: {
        required: true,
        type: Number,
    },
    numberOfLanes: {
        required: true,
        type: Number,
    },
    shoeSize: {
        required: true,
        type: [Number],
        validate: {
            validator: function (shoeSizes) {
                return shoeSizes.length === this.numberOfPlayers;
            },
            message: 'Antalet skostorlekar måste matcha antalet spelare',
        },
    },
    bookedLanes: {
        required: true,
        type: [String],
    },
    totalCost: {
        required: true,
        type: Number,
    },
    bookingId: {
        required: true,
        type: String,
        default: () => uuid()
    }

})



module.exports = mongoose.model('booking', bookingSchema);