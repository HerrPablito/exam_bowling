const bookingSchema = require('./booking.schema');
const lanesSchema = require('./lanes.schema');

async function newBooking(email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize) {
    const allUnbookedLanes = await lanesSchema.find({ booked: 0 });
    if (allUnbookedLanes.length < numberOfLanes) {
        throw new Error('Det finns inte tillräckligt med lediga banor');
    }

    let bookedLanesCounter = 0;
    let bookedLanes = [];

    for (const lane of allUnbookedLanes) {
        if (bookedLanesCounter < numberOfLanes) {
            lane.booked = 1;
            await lane.save();
            bookedLanesCounter++;
        } else {
            break;
        }
    }

    bookedLanes = allUnbookedLanes.slice(0, bookedLanesCounter).map(lane => lane.laneId);

    const totalLaneCost = numberOfLanes * 100;
    const totalPlayerCost = numberOfPlayers * 120;
    const totalCost = totalLaneCost + totalPlayerCost;

    const result = await bookingSchema.create({
        email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize, bookedLanes, totalCost
    });

    return result;
}



module.exports = { newBooking }


