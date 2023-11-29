import Booking from '../models/booking.model';
import cron from 'node-cron';
import BookingDetail from '../models/booking_detail.model';
import Driver from '../models/driver.model';
import DriverLogginSession from '../models/driver_login_session.model';
import { getDistanceFromLatLonInKm } from '../utils/distance'

export const listBookingSV = async ({ userId }) => {
  const bookings = await Booking.findAll({ where: { userId } });
  return bookings;
}

export const createBookingSV = async (bookingInput) => {
  console.log('bookingInput--', bookingInput);
  const { startTime } = bookingInput;
  // If booking time is equal or less than now
  //  Start booking now
  //    Save booking info
  //    Push to queue to process booking
  // const booking = await Booking.create({
  //   userId: bookingInput.userId,
  //   staffId: bookingInput.staffId,
  //   code: `BOOK_${new Date().getTime()}`,
  //   amount: bookingInput.amount,
  //   status: "WAITING_FOR_DRIVER",
  //   startTime: bookingInput.startTime,
  //   endTime: bookingInput.endTime,
  // });

  // const bookingDetail = await BookingDetail.create({
  //   bookingId: booking.id,
  //   pickUplongitude: bookingInput.bookingDetail.pickUplongitude,
  //   pickUplatitude: bookingInput.bookingDetail.pickUplatitude,
  //   dropOfflongitude: bookingInput.bookingDetail.dropOfflongitude,
  //   dropOfflatitude: bookingInput.bookingDetail.dropOfflatitude,
  //   appliedVoucher: bookingInput.bookingDetail.appliedVoucher,
  //   pickUpPoint: bookingInput.bookingDetail.pickUpPoint,
  //   dropOffPoint: bookingInput.bookingDetail.dropOffPoint,
  // });

  //  Push message to queue immediately
  // if (new Date(startTime).getTime() <= new Date().getTime()) {

  // }
  await handleAssignDriver(1);
  return null;
}

async function handleAssignDriver(bookingId) {
  const booking = await Booking.findOne({
    where: { id: bookingId },
    include: [
      {
        model: BookingDetail,
        as: "bookingDetail",
        limit: 1
      }
    ]
  });
  if (!booking) {
    throw new Error("Booking not found");
  }

  const availableDrivers = await Driver.findAll({
    include: [
      {
        model: DriverLogginSession,
        as: 'driverLoginSession',
        where: {
          status: "ONLINE",
          drivingStatus: "WAITING_FOR_CUSTOMER",
        },
        limit: 1
      }
    ]
  });
  console.log("booking.toJSON()----", booking.toJSON());

  if (!availableDrivers || availableDrivers.length === 0) {
    throw new Error("Cannot find driver")
  }

  let suitableDriverIdx = -1;
  let minDistance = Number.MAX_SAFE_INTEGER;

  availableDrivers.forEach((driver, idx) => {
    console.log("driver.toJSON()----", driver.toJSON());
    const { bookingDetail } = booking;
    const { driverLoginSession } = driver;
    const userPosition = {
      lat: bookingDetail[0].pickUplatitude,
      long: bookingDetail[0].pickUplongitude,
    }

    console.log("userPosition----", userPosition);

    const driverPosition = {
      lat: driverLoginSession[0].currentLat,
      long: driverLoginSession[0].currentLong,
    }

    console.log("driverPosition----", driverPosition);
    const distanceFromUserToDriver = getDistanceFromLatLonInKm(userPosition, driverPosition)
    console.log('distanceFromUserToDriver---', distanceFromUserToDriver);
    if (distanceFromUserToDriver < minDistance) {
      minDistance = distanceFromUserToDriver;
      suitableDriverIdx = idx;
    }
  });

  console.log("availableDrivers----", availableDrivers);

  console.log("suitableDriverIdx, minDistance----", suitableDriverIdx, minDistance);
}

function bookingScheduler() {
  cron.schedule('* * * * *', async () => {
    console.log('running a task every minute');
    const bookingsBooked = await Booking.findAll({ where: { status: "BOOKED" } });
    if (bookingsBooked && bookingsBooked.length > 0) {
      bookingsBooked.forEach(booking => {
        // Push to queue to process booking
      });
    }
  });
}
// bookingScheduler();