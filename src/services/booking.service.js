import Booking from '../models/booking.model';
import cron from 'node-cron';
import BookingDetail from '../models/booking_detail.model';
import Driver from '../models/driver.model';
import Vehicle from '../models/vehicle.model';
import DriverLogginSession from '../models/driver_login_session.model';
import { getDistanceFromLatLonInKm } from '../utils/distance'

export const listBookingSV = async ({ userId }) => {
  const bookings = await Booking.findAll({ where: { userId } });
  return bookings;
}

export const createBookingSV = async (bookingInput) => {
  const { bookingDetail } = bookingInput;
  const { startTime } = bookingInput;
  const booking = await Booking.create(
    {
      userId: bookingInput.userId,
      staffId: bookingInput.staffId,
      code: `BOOK_${new Date().getTime()}`,
      amount: bookingInput.amount,
      status: "WAITING_FOR_DRIVER",
      startTime: bookingInput.startTime,
      endTime: bookingInput.endTime,
      bookingDetail: {
        vehicleType: bookingDetail.vehicleType,
        pickUplongitude: bookingDetail.pickUplongitude,
        pickUplatitude: bookingDetail.pickUplatitude,
        dropOfflongitude: bookingDetail.dropOfflongitude,
        dropOfflatitude: bookingDetail.dropOfflatitude,
        appliedVoucher: bookingDetail.appliedVoucher,
        pickUpPoint: bookingDetail.pickUpPoint,
        dropOffPoint: bookingDetail.dropOffPoint,
      }
    },
    {
      include: [
        {
          model: BookingDetail,
          as: 'bookingDetail'
        }
      ]
    }
  );

  //  Push message to queue immediately
  if (new Date(startTime).getTime() <= new Date().getTime()) {
    const { driver, minDistance } = await getSuitableDriver(booking.id);
    const pricing = getPricing(minDistance);

    return {
      driver,
      minDistance,
      pricing,
    }
  }
  return {
    driver: null,
    price: 0,
  };
}

async function getAllAvailableDriver(booking) {
  return Driver.findAll({
    where: {
      vehicleType: booking.bookingDetail[0].vehicleType,
    },
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
}

function getNearestDriver(booking, availableDrivers) {
  let suitableDriverIdx = -1;
  let minDistance = Number.MAX_SAFE_INTEGER;

  availableDrivers.forEach((driver, idx) => {
    const { bookingDetail } = booking;
    const { driverLoginSession } = driver;

    const userPosition = {
      lat: bookingDetail[0].pickUplatitude,
      long: bookingDetail[0].pickUplongitude,
    }

    const driverPosition = {
      lat: driverLoginSession[0].currentLat,
      long: driverLoginSession[0].currentLong,
    }

    // Calculate distance from driver and user
    const distanceFromUserToDriver = getDistanceFromLatLonInKm(userPosition, driverPosition)
    if (distanceFromUserToDriver < minDistance) {
      minDistance = distanceFromUserToDriver;
      suitableDriverIdx = idx;
    }
  });

  if (minDistance === Number.MAX_SAFE_INTEGER) {
    throw new Error("invalid lat long");
  }

  if (suitableDriverIdx === -1) {
    return null;
  }

  return {
    driver: availableDrivers[suitableDriverIdx],
    minDistance
  };
}

async function getSuitableDriver(bookingId) {
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
  
  const availableDrivers = await getAllAvailableDriver(booking);

  if (!availableDrivers || availableDrivers.length === 0) {
    throw new Error("Cannot find driver")
  }


  const { driver, minDistance } = getNearestDriver(booking, availableDrivers);

  const driverDetail = await Driver.findOne({
    where: {
      id: driver.id
    },
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
      }
    ]
  });

  return {
    driver: driverDetail,
    minDistance
  };
}

function getPricing(minDistance) {
  return minDistance * 10000;
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