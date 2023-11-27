import { listBookingSV } from '../services/booking.service';

export const listBookingCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const { user: { customer: { id } } } = res.locals;
    const bookings = await listBookingSV({ userId: id });
    res.status(201).json({
      status: 'SUCCESS',
      data: bookings
    })

  } catch (err) {
    next(err);
  }
}