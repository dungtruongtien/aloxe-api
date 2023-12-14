import Booking from '../models/booking.model';
import bcrypt from 'bcryptjs';
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
import { zonedTimeToUtc } from 'date-fns-tz';
import Auth from '../models/auth.model';
import { Op } from 'sequelize';

export const listBookingSV = async ({ customerId, staffId, driverId, status, search }) => {
  const condition = {};
  if (search) {
    condition[Op.or] = [
      {
        '$nguoi_dung.so_dien_thoai$': {
          like: search,
        }
      },
      {
        '$nguoi_dung.so_dien_thoai$': {
          like: search,
        }
      }
    ]
  }
  if (staffId) {
    condition.staffId = staffId;
  }
  if (driverId) {
    condition.driverId = driverId;
  }
  if (customerId) {
    condition.customerId = customerId;
  }
  if (status) {
    condition.status = status;
  }
  const bookings = await Booking.findAll({
    order: [
      ["thoi_gian_tao", "DESC"]
    ],
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
    const userInfo = await __getUserInfo(customer);
    console.log('userInfo-----', userInfo);
    customerId = userInfo.customer.id;
    user = userInfo;
  } else {

  }

  let resp = { driver: null, price: 0, user, };

  const { bookingDetail } = bookingInput;


  const pickPosition = {
    lat: bookingDetail.pickUpLatitude,
    long: bookingDetail.pickUpLongitude,
  }

  const dropoffPosition = {
    lat: bookingDetail.dropOffLatitude,
    long: bookingDetail.dropOffLongitude,
  }

  const distance = getDistanceFromLatLonInKm(pickPosition, dropoffPosition);
  const pricing = distance * 10000; // 10000 each km

  console.log('pricing----', pricing);
  resp.pricing = pricing;


  console.log('bookingInput-----', bookingInput);
  const { startTime } = bookingInput;
  const bookingDto = {
    customerId,
    staffId: bookingInput.staffId,
    code: `BOOK_${new Date().getTime()}`,
    status: "BOOKED",
    startTime: bookingInput.startTime,
    endTime: bookingInput.endTime,
    amount: pricing,
    bookingDetail: {
      vehicleType: bookingDetail.vehicleType,
      pickUpLongitude: bookingDetail.pickUpLongitude,
      pickUpLatitude: bookingDetail.pickUpLatitude,
      dropOffLongitude: bookingDetail.dropOffLongitude,
      dropOffLatitude: bookingDetail.dropOffLatitude,
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
    const customer = await Customer.findOne({
      where: { id: customerId },
      include: [
        {
          model: User,
          as: 'user',
        }
      ]
    });
    resp = {
      ...driverInfo,
      booking: { ...bookingDto, id: booking.id, status: "DRIVER_FOUND", driver: driverInfo.driver },
      user
    }

    // Handle send message to socket channels
    console.log('driverInfo.id----', driverInfo.driver.id);
    if (booking.staffId) {
      broadcastPrivateMessage(booking.staffId, "Hello");
    }
    broadcastPrivateMessage(booking.id, "Hello");
    broadcastPrivateMessage(driverInfo.driver.id, JSON.stringify({
      message: "Bạn có 1 đơn đặt xe",
      booking: { ...bookingDto, id: booking.id, status: "DRIVER_FOUND", minDistance: driverInfo.minDistance },
      customer: {
        fullName: customer.user.fullName,
        phoneNumber: customer.user.phoneNumber,
        avatar: customer.user.avatar,
      }
    }));
    console.log('After broadcasting-------');
  }

  return resp;
}

export const bookingDriverActionSV = async (driverId, bookingId, actionType, assignedDriverId) => {
  console.log('actionType----', actionType);
  console.log('bookingId-----', bookingId);
  console.log('assignedDriverId----', assignedDriverId);
  let bookingResp = null;
  switch (actionType) {
    case "CONFIRMED":
      bookingResp = await Booking.update(
        {
          status: "DRIVER_CONFIRMED"
        },
        {
          where: { id: bookingId },
        },
      )
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "DRIVER_CONFIRMED" }));
      return bookingResp;
    case "CANCELLED":
      bookingResp = await Booking.update(
        {
          status: "CANCELLED"
        },
        {
          where: { id: bookingId }
        },
      );
      await DriverLogginSession.update(
        {
          drivingStatus: "WAITING_FOR_CUSTOMER"
        },
        {
          where: { driverId }
        },
      );
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "CANCELLED", message: "Driver is cancelled your booking, please retry to book a new car." }));
      return bookingResp;
    case "USER_CANCELLED":
      console.log('assignedDriverId---', assignedDriverId);
      bookingResp = await Booking.update(
        {
          status: "CANCELLED"
        },
        {
          where: { id: bookingId }
        },
      );
      if (assignedDriverId) {
        await DriverLogginSession.update(
          {
            drivingStatus: "WAITING_FOR_CUSTOMER"
          },
          {
            where: { driverId: assignedDriverId }
          },
        );
        broadcastPrivateMessage(assignedDriverId, JSON.stringify({ status: "USER_CANCELLED", message: "Customer cancelled your booking." }));
      }
      return bookingResp;
    case "ARRIVED":
      bookingResp = await Booking.update(
        {
          status: "ARRIVED"
        },
        {
          where: { id: bookingId }
        },
      );
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "ARRIVED" }));
      return bookingResp;
    case "PAID":
      bookingResp = await Booking.update(
        {
          status: "PAID"
        },
        {
          where: { id: bookingId }
        },
      );
      if (driverId) {
        await DriverLogginSession.update(
          {
            drivingStatus: "WAITING_FOR_CUSTOMER"
          },
          {
            where: { driverId }
          },
        );
      }
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "PAID" }));
      return bookingResp;
    case "ONBOARDING":
      bookingResp = await Booking.update(
        {
          status: "ONBOARDING"
        },
        {
          where: { id: bookingId }
        },
      );
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "ONBOARDING" }));
      return bookingResp;
    case "DRIVER_COME":
      bookingResp = await Booking.update(
        {
          status: "DRIVER_COME"
        },
        {
          where: { id: bookingId }
        },
      );
      broadcastPrivateMessage(bookingId, JSON.stringify({ status: "DRIVER_COME" }));
      return bookingResp;
    default:
      break;
  }

}

async function __getUserInfo(customer) {
  const user = await User.findOne({
    where: { phoneNumber: customer.phoneNumber },
    include: [{ model: Customer, as: 'customer' }],
  });
  if (!user) {
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("abc123", salt);

    const userCreatedResp = await User.create(
      {
        name: customer.fullName,
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        customer: {
          level: "NORMAL"
        },
        account: {
          username: "",
          password: hashedPassword
        },
      },
      {
        include: [
          {
            model: Customer,
            as: 'customer'
          },
          {
            model: Auth,
            as: 'account'
          }
        ]
      });
    console.log('userCreatedResp----', userCreatedResp);
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
      lat: bookingDetail.pickUpLatitude,
      long: bookingDetail.pickUpLongitude,
    }

    const driverPosition = {
      lat: driverLoginSession.currentLat,
      long: driverLoginSession.currentLong,
    }

    // Calculate distance from driver and user
    const distanceFromUserToDriver = getDistanceFromLatLonInKm(userPosition, driverPosition);
    console.log('distanceFromUserToDriver----', distanceFromUserToDriver);
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

  const { bookingDetail } = booking;
  const pickPosition = {
    lat: bookingDetail.pickUpLatitude,
    long: bookingDetail.pickUpLongitude,
  }

  const dropoffPosition = {
    lat: bookingDetail.dropOffLatitude,
    long: bookingDetail.dropOffLongitude,
  }

  const distance = getDistanceFromLatLonInKm(pickPosition, dropoffPosition);
  const pricing = distance * 10000; // 10000 each km


  if (!driver) {
    await Booking.update(
      { status: "DRIVER_NOT_FOUND", },
      { where: { id: booking.id } }
    );
    throw new NotfoundError("Cannot found driver");
  }

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
  cron.schedule('*/10 * * * * *', async () => {
    console.log('running a task every minute');
    const bookingsBooked = await Booking.findAll({
      where: { status: "BOOKED" },
      include: [
        {
          model: BookingDetail,
          as: "bookingDetail",
        }
      ]
    });
    if (bookingsBooked && bookingsBooked.length > 0) {
      try {
        bookingsBooked.forEach(async (bookingData) => {
          console.log('bookingData.id---', bookingData.id);
          const nowInVN = zonedTimeToUtc(new Date(), "Asia/Ho_Chi_Minh");
          const startTimeInVN = zonedTimeToUtc(new Date(bookingData.startTime), "Asia/Ho_Chi_Minh");
          if (startTimeInVN.getTime() <= nowInVN.getTime()) {

            const driverInfo = await __handleAssignDriverForBooking(bookingData);
            const customerData = await Customer.findOne({
              where: { id: bookingData.customerId },
              include: [
                {
                  model: User,
                  as: 'user',
                }
              ]
            });
            // Handle send message to socket channels
            console.log('driverInfo.id----', driverInfo.driver.id);
            broadcastPrivateMessage(bookingData.id, "Hello");
            if (bookingData.staffId) {
              broadcastPrivateMessage(bookingData.staffId, "Hello");
            }
            broadcastPrivateMessage(driverInfo.driver.id, JSON.stringify({
              message: "Bạn có 1 đơn đặt xe",
              booking: { ...bookingData.toJSON(), status: "DRIVER_FOUND" },
              customer: {
                fullName: customerData.user.fullName,
                phoneNumber: customerData.user.phoneNumber,
                avatar: customerData.user.avatar,
              }
            }));
            console.log('After broadcasting-------');
          }
        });
      } catch (err) {
        return null;
      }
    }
  });
}
bookingScheduler();