const Booking = require('./booking.schema');
const Lane = require('./lanes.schema');

const moment = require('moment');


async function newBooking(email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize) {

  const allLanes = await Lane.find();
  const startTime = moment(`${timeToBowl.year}-${timeToBowl.month}-${timeToBowl.day} ${timeToBowl.hour}:00`, 'YYYY-MM-DD HH:mm');
  const endTime = startTime.clone().add(1, 'hour');

  const availableLanes = allLanes.filter(lane => {
    return !lane.bookings.some(booking => {
      const bookingStartTime = moment(booking.startTime, 'YYYY-MM-DD HH:mm');
      const bookingEndTime = moment(booking.endTime, 'YYYY-MM-DD HH:mm');
      return (
        startTime.isBetween(bookingStartTime, bookingEndTime, undefined, '[)') ||
        endTime.isBetween(bookingStartTime, bookingEndTime, undefined, '(]')
      );
    });
  });

  if (availableLanes.length < numberOfLanes) {
    throw new Error('Det finns inte tillräckligt med lediga banor');
  }

  let bookedLanes = [];

  for (let i = 0; i < numberOfLanes; i++) {
    const lane = availableLanes[i];
    lane.bookings.push({ startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    await lane.save();
    bookedLanes.push(lane.laneId);
  }

  const totalLaneCost = numberOfLanes * 100;
  const totalPlayerCost = numberOfPlayers * 120;
  const totalCost = totalLaneCost + totalPlayerCost;

  const result = await Booking.create({
    email,
    startTime: timeToBowl,
    endTime: timeToBowl,
    numberOfPlayers,
    numberOfLanes,
    shoeSize,
    bookedLanes,
    totalCost,
  });

  return result;
}

async function updateBookedLanes(booking, newNumberOfLanes) {
  // Hämta och sortera alla banor
  const lanes = await Lane.find().sort((a, b) => {
    const aId = parseInt(a.laneId.replace("Lane", ""));
    const bId = parseInt(b.laneId.replace("Lane", ""));
    return aId - bId;
  }).exec();

  // Ta bort de gamla bokningarna från de tidigare bokade banorna
  for (const lane of lanes) {
    const bookingIndex = lane.bookings.findIndex(
      (otherBooking) => otherBooking._id.equals(booking._id)
    );
    if (bookingIndex !== -1) {
      lane.bookings.splice(bookingIndex, 1);
      await lane.save();
    }
  }

  // Hitta lediga banor och boka dem
  const startTime = moment(booking.startTime);
  const endTime = moment(booking.endTime);
  const availableLanes = await getAvailableLanes(startTime, endTime, lanes);
  const newBookedLanes = availableLanes.slice(0, newNumberOfLanes).map((lane) => lane.laneId);

  // Lägg till nya bokningar på de lediga banorna
  for (const laneId of newBookedLanes) {
    const lane = lanes.find((lane) => lane.laneId === laneId);
    if (lane) {
      lane.bookings.push({ startTime: startTime.toISOString(), endTime: endTime.toISOString() });
      await lane.save();
    }
  }

  // Uppdatera bookedLanes i bokningen
  booking.bookedLanes = newBookedLanes;
}


async function updateBooking(bookingId, email, timeToBowl, numberOfPlayers, numberOfLanes, shoeSize) {

  const booking = await Booking.findOne({ bookingId: bookingId });


  const totalLaneCost = numberOfLanes * 100;
  const totalPlayerCost = numberOfPlayers * 120;
  const totalCost = totalLaneCost + totalPlayerCost;

  const bookedLanes = await updateLanesArr(timeToBowl, numberOfLanes, bookingId);
  console.log("bookedLanes:", bookedLanes)
  if (booking) {
    booking.email = email;
    booking.startTime = timeToBowl;
    booking.endTime = timeToBowl;
    booking.numberOfPlayers = numberOfPlayers;
    booking.numberOfLanes = numberOfLanes;
    booking.shoeSize = shoeSize;
    booking.totalCost = totalCost;
    booking.bookedLanes = bookedLanes;
    // if (booking.numberOfLanes !== numberOfLanes) {
    //   await updateBookedLanes(booking, numberOfLanes);
    // }
    const updatedBooking = await booking.save();
    return updatedBooking;

  }

  return null;
}

async function updateLanesArr(timeToBowl, numberOfLanes, bookingId) {

  const myBooking = await Booking.findOne({ bookingId: bookingId });
  //console.log("myBooking:", myBooking)
  const startTime = moment(`${timeToBowl.year}-${timeToBowl.month}-${timeToBowl.day} ${timeToBowl.hour}:00`, 'YYYY-MM-DD HH:mm');
  const endTime = startTime.clone().add(1, 'hour');

  const deleteLanes = await Lane.updateMany(
    { laneId: myBooking.bookedLanes },
    //console.log("myBooking.bookedLanes:", myBooking.bookedLanes),
    {
      $pull: {
        bookings: {
          startTime: myBooking.startTime,
          endTime: myBooking.endTime,
        },
      },
    }
  );console.log("deleteLanes.modifiedCount:", deleteLanes.modifiedCount);
  let bookedLanes = [];
  if (deleteLanes.modifiedCount > 0) {
    const allLanes = await Lane.find();
    const availableLanes = allLanes.filter(lane => {
      return !lane.bookings.some(booking => {
        const bookingStartTime = moment(booking.startTime, 'YYYY-MM-DD HH:mm');
        const bookingEndTime = moment(booking.endTime, 'YYYY-MM-DD HH:mm');
        return (
          startTime.isBetween(bookingStartTime, bookingEndTime, undefined, '[)') ||
          endTime.isBetween(bookingStartTime, bookingEndTime, undefined, '(]')
        );
      });console.log("deleteLanes:", deleteLanes)
    });

    if (availableLanes.length < numberOfLanes) {
      throw new Error('Det finns inte tillräckligt med lediga banor');
      //console.log("availableLanes.length:", availableLanes.length); 
    }

    

    for (let i = 0; i < numberOfLanes; i++) {
      const lane = availableLanes[i];
      lane.bookings.push({ startTime: startTime.toISOString(), endTime: endTime.toISOString() });
      await lane.save();
      bookedLanes.push(lane.laneId);
    }
    
  } else {
    console.log("test");
    bookedLanes = myBooking.bookedLanes;
  } console.log("Returning bookedLanes:", bookedLanes); 
  return bookedLanes;
}


async function getBookingByDate(startDate, endDate) {

  const start = moment(`${startDate.year}-${startDate.month}-${startDate.day} 00:00`, 'YYYY-MM-DD HH:mm');
  const end = moment(`${endDate.year}-${endDate.month}-${endDate.day} 00:00`, 'YYYY-MM-DD HH:mm');
  const bookings = await Booking.find({
    startTime: {
      $gte: start,
      $lt: end,
    },
  });

  return bookings;
}


module.exports = { newBooking, updateBooking, getBookingByDate }


