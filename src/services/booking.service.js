import Booking from '../models/booking.model';

export const listBookingSV = async ({ userId }) => {
  const bookings = await Booking.findAll({ where: { userId } });
  return bookings;
}