import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import Auth from '../models/auth.model';
import Driver from '../models/driver.model';
import Customer from '../models/customer.model';
import { BusinessError, NotfoundError } from '../common/customError';
import { format } from 'date-fns';
import DriverLoginSession from '../models/driver_login_session.model';

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
  console.log('userId--', userId);
  const userData = await User.findOne({
    where: { id: userId },
    attributes: ['email', 'fullName', 'name', 'id']
  });
  if (!userData) {
    throw new NotfoundError('User not existed', 'UserNotFound');
  }

  return userData;
}

export const handleDriverOnlineSv = async ({userId, lat, long}) => {
  const userData = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: Driver,
        as: "driver",
      }
    ]
  });
  if (!userData) {
    throw new BusinessError('User not existed', 'UserNotFound');
  }

  const updated = await DriverLoginSession.create({
    driverId: userData.driver.id,
    currentLat: lat,
    currentLong: long,
    status: "ONLINE",
    drivingStatus: "WAITING_FOR_CUSTOMER",
  });

  if(!updated) {
    throw new Error("Cannot switch user to online status");
  }

  return updated;
}
