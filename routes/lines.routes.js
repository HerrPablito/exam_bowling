const { Router } = require('express');
const { lines } = require('../model/lines.model');
const router = Router()


//spara antekningar
router.post('/', async (request, response) => {
    const { lineId, booked } = request.body
    try {
        const result = await createLines(email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize)
        response.status(200).json(result)
    } catch (error) {
        response.status(500).json({ message: error.message }
        )
    }
})


module.exports = router