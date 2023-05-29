
const lanesSchema = require('./lanes.schema');

async function newLane() {
   
    const laneId = "Lane08"
    const booked = 0
    const result = await lanesSchema.create({
        laneId, booked
    });

    return result;
}

module.exports = { newLane }
