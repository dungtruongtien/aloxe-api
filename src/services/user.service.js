import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import Auth from '../models/auth.model';
import Customer from '../models/customer.model';
import { BusinessError } from '../common/customError';
import { format } from 'date-fns';

export const handleRegisterSv = async ({ password, name, fullName, phoneNumber, email, address, username, dob }) => {
  const existsEmail = await User.findOne({ where: { email } });
  if (existsEmail) {
    throw new BusinessError('This email was registerd', 'RegisterdEmail');
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
    account: {
      username,
      password: hashedPassword
    }
  };
  const user = await User.create(userInput);

  const account = await Auth.create({
    userId: user.id,
    username,
    password: hashedPassword,
  });

  const customer = await Customer.create({
    userId: user.id,
    dob: format(new Date(dob), "yyyy-MM-dd"),
    address,
    level: "NORMAL"
  })
  return user;
}


export const handleMeSv = async (userId) => {
  const userData = await User.findOne({
    where: { id: userId },
    attributes: ['email', 'fullName', 'name', 'id']
  });
  if (!userData) {
    throw new BusinessError('User not existed', 'UserNotFound');
  }

  return userData;
}
