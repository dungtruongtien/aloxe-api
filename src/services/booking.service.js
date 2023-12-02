import Booking from '../models/booking.model';
import cron from 'node-cron';
import Driver from '../models/driver.model';
import User from '../models/user.model';
import Staff from '../models/staff.model';
import BookingDetail from '../models/booking_detail.model';
import Customer from '../models/customer.model';
import Vehicle from '../models/vehicle.model';
import DriverLogginSession from '../models/driver_login_session.model';
import { getDistanceFromLatLonInKm } from '../utils/distance'
import DriverLoginSession from '../models/driver_login_session.model';
import { NotfoundError } from '../common/customError';

export const listBookingSV = async ({ userId, staffId, driverId }) => {
  const condition = {};
  if (staffId) {
    condition.staffId = staffId;
  }
  if (driverId) {
    condition.driverId = driverId;
  }
  if (userId) {
    condition.userId = userId;
  }
  const bookings = await Booking.findAll({
    where: { ...condition },
    include: [
      {
        model: BookingDetail,
        as: "bookingDetail",
      },
      {
        model: Customer,
        as: "customer",
        include: [
          {
            model: User,
            as: "user"
          }
        ]
      },
      {
        model: Driver,
        as: "driver",
        include: [
          {
            model: User,
            as: "user"
          },
          {
            model: Vehicle,
            as: "vehicle"
          }
        ]
      },
      {
        model: Staff,
        as: "staff",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "fullName"]
          }
        ]
      },
    ]
  });
  return bookings;
}

export const detailBookingSV = async ({ bookingId }) => {
  const bookings = await Booking.findOne({
    where: { id: bookingId },
    include: [
      {
        model: BookingDetail,
        as: "bookingDetail",
      },
      {
        model: Customer,
        as: "customer",
        include: [
          {
            model: User,
            as: "user"
          }
        ]
      },
      {
        model: Driver,
        as: "driver",
        include: [
          {
            model: User,
            as: "user"
          },
          {
            model: Vehicle,
            as: "vehicle"
          }
        ]
      }
    ]
  });
  return bookings;
}

export const updateBookingSV = async (id, updated) => {
  const bookings = await Booking.update(
    updated,
    {
      where: { id },
    }
  );
  return bookings;
}

export const createBookingSV = async (bookingInput) => {
  const { customer } = bookingInput;
  let customerId = bookingInput.customerId;
  let user = null;

  // Validate exist user or not
  if (customer && customer.phoneNumber) {
    user = await User.findOne({
      where: { phoneNumber: customer.phoneNumber },
      include: [{ model: Customer, as: 'customer' }],
    });
    if (!user) {
      const userCreatedResp = await User.create(
        {
          name: customer.fullName,
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          customer: {
            level: "NORMAL"
          }
        },
        {
          include: [
            {
              model: Customer,
              as: 'customer'
            }
          ]
        });
      if (!userCreatedResp) {
        throw new Error("Cannot create account")
      }
      customerId = userCreatedResp.customer.id;
      user = userCreatedResp;
    } else {
      customerId = user.customer.id;
    }
  }

  const resp = {
    driver: null,
    price: 0,
    user,
  }
  const { bookingDetail } = bookingInput;
  const { startTime } = bookingInput;
  const booking = await Booking.create(
    {
      customerId,
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
    return {
      ...await handleAssignDriverForBooking(booking),
      booking,
      user
    }
  }
  return resp;
}


async function getAllAvailableDriver(booking) {
  return Driver.findAll({
    where: {
      vehicleType: booking.bookingDetail.vehicleType,
    },
    include: [
      {
        model: DriverLogginSession,
        as: 'driverLoginSession',
        where: {
          status: "ONLINE",
          drivingStatus: "WAITING_FOR_CUSTOMER",
        },
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
    if (!driverLoginSession || driverLoginSession.length == 0) {
      return;
    }

    const userPosition = {
      lat: bookingDetail.pickUplatitude,
      long: bookingDetail.pickUplongitude,
    }

    const driverPosition = {
      lat: driverLoginSession.currentLat,
      long: driverLoginSession.currentLong,
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
      }
    ]
  });
  if (!booking) {
    throw new Error("Booking not found");
  }

  const availableDrivers = await getAllAvailableDriver(booking);

  if (!availableDrivers || availableDrivers.length === 0) {
    throw new NotfoundError("Cannot found driver");
  }


  const { driver, minDistance } = getNearestDriver(booking, availableDrivers);
  if (!driver) {
    return null
  }

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

const handleAssignDriverForBooking = async (booking) => {
  const { driver, minDistance } = await getSuitableDriver(booking.id);
    if (!driver) {
      resp.status = "DRIVER_NOT_FOUND";
      return resp;
    }
    const pricing = getPricing(minDistance);

    const updateBookingResp = await Booking.update({ driverId: driver.id, status: "DRIVER_FOUND" }, { where: { id: booking.id } });
    const updateDriverResp = await DriverLoginSession.update(
      { drivingStatus: "DRIVING" },
      {
        where: {
          driverId: driver.id,
          status: "ONLINE"
        }
      }
    );
    if (!updateBookingResp || !updateDriverResp) {
      throw new Error("Can not assign driver");
    }

    return {
      driver,
      minDistance,
      pricing,
      status: "DRIVER_FOUND"
    }
}

function bookingScheduler() {
  cron.schedule('* * * * *', async () => {
    console.log('running a task every minute');
    const bookingsBooked = await Booking.findAll({ where: { status: "BOOKED" } });
    if (bookingsBooked && bookingsBooked.length > 0) {
      bookingsBooked.forEach(booking => {
        handleAssignDriverForBooking(booking);
      });
    }
  });
}
// bookingScheduler();