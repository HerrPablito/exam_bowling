const mongoose = require('mongoose');
const moment = require('moment');
const uuid = require('uuid-random')



const bookingSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
    },
    startTime: {
        required: true,
        type: Date,
        set: function(timeObj) {
            return moment(`${timeObj.year}-${timeObj.month}-${timeObj.day} ${timeObj.hour}:00`, 'YYYY-MM-DD HH:mm').toDate();
        },
    },
    endTime: {
        required: true,
        type: Date,
        set: function(timeObj) {
            const startTime = moment(`${timeObj.year}-${timeObj.month}-${timeObj.day} ${timeObj.hour}:00`, 'YYYY-MM-DD HH:mm');
            return startTime.clone().add(1, 'hour').toDate();
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
        validator: async function (bookedLanes) {
            const allLanes = await Lane.find();
            const numberOfLanes = this.numberOfLanes;
          
            const startTime = moment(this.timeToBowl, 'YYYY-MM-DD HH:mm').toDate();
            const endTime = moment(startTime).add(1, 'hour').toDate();

            const availableLanes = allLanes.filter(lane => {
              return !lane.bookings.some(booking => {
                return (
                  (startTime >= booking.startTime && startTime < booking.endTime) ||
                  (endTime > booking.startTime && endTime <= booking.endTime)
                );
              });
            });

            if (availableLanes.length < numberOfLanes) {
              return false;
            }
          
            return true;
          }
        
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



module.exports = mongoose.model('Booking', bookingSchema);