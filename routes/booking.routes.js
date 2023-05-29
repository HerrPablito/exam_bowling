const { Router } = require('express');
const { newBooking } = require('../model/booking.model');
const { newLane } = require('../model/lanes.model');
const bookingSchema = require('../model/booking.schema');
const lanesSchema = require('../model/lanes.schema');
const router = Router()


//spara antekningar
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
    console.log(request.params.bookingId);
    const { bookingId } = request.params.bookingId
    try {
        const result = await bookingSchema.findOne(bookingId)
        response.json({ success: true, result })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }

})

router.delete('/:bookingId', async (request, response) => {
    
    const { bookingId } = request.params.bookingId
    try {
        const removeBooking = await bookingSchema.deleteOne(bookingId)
        if (removeBooking) {
            await lanesSchema.updateMany({ laneId: { $in: removeBooking.bookedLanes } }, { booked: 0 })
            response.json({ success: true, message: "Bokningen är borttagen" })
        }
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