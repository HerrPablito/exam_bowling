const { Router } = require('express');
const { newBooking, updateBooking, getBookingByDate } = require('../model/booking.model');
const { newLane } = require('../model/lanes.model');
const Booking = require('../model/booking.schema');
const Lanes = require('../model/lanes.schema');
const router = Router()


router.post('/', async (request, response) => {

    const { email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize } = request.body

    try {
        const result = await newBooking(email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize)
        response.status(200).json(result)
    } catch (error) {
        response.status(500).json({ message: error.message }
        )
    }

})

router.get('/:bookingId', async (request, response) => {

    const { bookingId } = request.params
    try {
        const result = await Booking.findOne({ bookingId: bookingId })
        response.json({ success: true, result })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }

})

router.post('/search', async (request, response) => {

    const { startDate, endDate } = request.body
    try {
        const result = await getBookingByDate(startDate, endDate)
        response.json({ success: true, result, })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }

})


router.delete('/:bookingId', async (request, response) => {
    const { bookingId } = request.params;
    const myBooking = await Booking.findOne({ bookingId: bookingId });

    if (!myBooking) {
        return response.json({ success: false, message: "Bokningen kunde inte hittas. Du har troliget angett fel BookingId eller så är bokningen redan raderad" });
    }

    try {

        const removeBooking = await Booking.deleteOne({ bookingId: bookingId });

        if (removeBooking.deletedCount > 0) {
            const removedBooking = await Lanes.updateOne(
                { laneId: myBooking.bookedLanes[0] },
                {
                    $pull: {
                        bookings: {

                            startTime: myBooking.startTime,
                            endTime: myBooking.endTime,
                        },
                    },
                }
            );
            console.log(removedBooking);

            if (removedBooking.modifiedCount > 0) {
                response.json({ success: true, message: "Bokningen är borttagen" });
            } else {
                response.json({ success: false, message: "Bokningen kunde inte tas bort från Lanes. Du har troliget angett fel laneId, startTime eller endTime, eller så är bokningen redan raderad" });
            }
        } else {
            response.json({ success: false, message: "Bokningen kunde inte tas bort. Du har troliget angett fel BookingId eller så är bokningen redan raderad" });
        }
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});


router.put('/', async (request, response) => {

    const { bookingId, email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize } = request.body
    try {
        const result = await updateBooking(bookingId, email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize)
        response.json({ success: true, result })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }

})


router.post('/lanes', async (request, response) => {

    try {
        const result = await newLane()
        response.status(200).json(result)
    } catch (error) {
        response.status(500).json({ message: error.message }
        )
    }

})



module.exports = router