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
import { broadcastPrivateMessage } from '../client/socket';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export const listBookingSV = async ({ customerId, staffId, driverId }) => {
  const condition = {};
  if (staffId) {
    condition.staffId = staffId;
  }
  if (driverId) {
    condition.driverId = driverId;
  }
  if (customerId) {
    condition.customerId = customerId;
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
  const booking = await Booking.update(
    updated,
    {
      where: { id },
    }
  );
  return booking;
}

export const createBookingSV = async (bookingInput) => {
  const { customer } = bookingInput;
  let customerId = bookingInput.customerId;
  let user = null;

  // Validate exist user or not
  if (customer && customer.phoneNumber) {
    const customerInfo = __getCustomerInfo(customer);
    customerId = customerInfo.id;
    user = customerInfo;
  }

  let resp = { driver: null, price: 0, user, };

  const { bookingDetail } = bookingInput;
  const { startTime } = bookingInput;
  const bookingDto = {
    customerId,
    staffId: bookingInput.staffId,
    code: `BOOK_${new Date().getTime()}`,
    status: "BOOKED",
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
  }

  const booking = await Booking.create(bookingDto,
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
  const nowInVN = zonedTimeToUtc(new Date(), "Asia/Ho_Chi_Minh");
  const startTimeInVN = zonedTimeToUtc(new Date(startTime), "Asia/Ho_Chi_Minh");
  if (startTimeInVN.getTime() <= nowInVN.getTime()) {
    const driverInfo = await __handleAssignDriverForBooking(booking);
    resp = {
      ...driverInfo,
      booking: { ...bookingDto, status: "DRIVER_FOUND" },
      user
    }

    // Handle send message to socket channels
    broadcastPrivateMessage(booking.id, "Hello");
    broadcastPrivateMessage(driverInfo.id, JSON.stringify({ message: "Order is assigned to you" }));
  }

  return resp;
}

export const bookingDriverAction = (bookingId, type) => {

}

async function __getCustomerInfo(customer) {
  const user = await User.findOne({
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
    return userCreatedResp;
    // customerId = userCreatedResp.customer.id;
    // user = userCreatedResp;
    // return user;
  }
  return user;
  // customerId = user.customer.id;
}

function __getNearestDriver(booking, availableDrivers) {
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
    return { driver: null };
  }

  return {
    driver: availableDrivers[suitableDriverIdx],
    minDistance
  };
}

async function __getSuitableDriver(bookingId) {
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

  const availableDrivers = await Driver.findAll({
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
      },
      {
        model: Vehicle,
        as: 'vehicle',
      }
    ]
  });

  if (!availableDrivers || availableDrivers.length === 0) {
    return { driver: null }
  }


  const { driver, minDistance } = __getNearestDriver(booking, availableDrivers);
  if (!driver) {
    return null
  }

  return {
    driver,
    minDistance
  };
}

const __handleAssignDriverForBooking = async (booking) => {
  const { driver, minDistance } = await __getSuitableDriver(booking.id);
  
  if (!driver) {
    await Booking.update(
      { status: "DRIVER_NOT_FOUND", },
      { where: { id: booking.id } }
    );
    throw new NotfoundError("Cannot found driver");
  }

  const pricing = minDistance * 10000; // 10000 each km

  const updateBookingResp = await Booking.update(
    {
      driverId: driver.id, status: "DRIVER_FOUND",
      amount: pricing,
    },
    {
      where: { id: booking.id }
    }
  );

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
        __handleAssignDriverForBooking(booking);
      });
    }
  });
}
// bookingScheduler();