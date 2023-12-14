import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import Auth from '../models/auth.model';
import Driver from '../models/driver.model';
import Customer from '../models/customer.model';
import { BusinessError, NotfoundError } from '../common/customError';
import { format } from 'date-fns';
import DriverLoginSession from '../models/driver_login_session.model';
import { broadcastPrivateMessage } from '../client/socket';

export const handleRegisterSv = async ({ password, name, fullName, phoneNumber, email, address, username, dob, role }) => {
  const existsEmail = await User.findOne({ where: { phoneNumber } });
  if (existsEmail) {
    throw new BusinessError('This phone number was registerd', 'RegisterdPhoneNumber');
  }

  var salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const userInput = {
    email,
    fullName,
    name,
    phoneNumber,
    email,
    address,
    role,
    account: {
      username,
      password: hashedPassword
    },
    customer: {
      dob: format(new Date(dob), "yyyy-MM-dd"),
      address,
      level: "NORMAL"
    }
  };
  const user = await User.create(userInput, {
    include: [
      {
        model: Auth,
        as: "account"
      },
      {
        model: Customer,
        as: "customer"
      }
    ]
  });

  return user;
}


export const handleMeSv = async (userId) => {
  const userData = await User.findOne({
    where: { id: userId },
    attributes: ['email', 'fullName', 'name', 'id'],
    include: [
      {
        model: Driver,
        as: "driver",
        include: [
          {
            model: DriverLoginSession,
            as: "driverLoginSession"
          }
        ]
      }
    ]
  });
  if (!userData) {
    throw new NotfoundError('User not existed', 'UserNotFound');
  }

  return userData;
}

export const handleDriverOnlineSv = async ({ driverId, lat, long, type }) => {
  if (type === "OFFLINE") {
    return DriverLoginSession.destroy({ where: { driverId } });
  }
  const driverData = await Driver.findOne({
    where: { id: driverId },
  });
  if (!driverData) {
    throw new BusinessError('User not existed', 'UserNotFound');
  }

  try {
    const created = await DriverLoginSession.create({
      driverId: driverData.id,
      currentLat: lat,
      currentLong: long,
      status: "ONLINE",
      drivingStatus: "WAITING_FOR_CUSTOMER",
    });
    if (!created) {
      throw new Error("Cannot switch user to online status");
    }
    broadcastPrivateMessage(driverData.id, "Hello");
    return created;
  } catch (err) {
    return null;
  }

}
