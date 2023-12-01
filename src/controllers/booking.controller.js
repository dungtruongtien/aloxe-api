import { createBookingSV, detailBookingSV, listBookingSV, updateBookingSV } from '../services/booking.service';

export const listBookingCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const { staffId, userId, driverId } = req.query;
    const bookings = await listBookingSV({ userId, staffId, driverId });
    res.status(201).json({
      status: 'SUCCESS',
      data: bookings
    })

  } catch (err) {
    next(err);
  }
}

export const detailBookingCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const { id } = req.params;
    const bookings = await detailBookingSV({ bookingId: id });
    res.status(201).json({
      status: 'SUCCESS',
      data: bookings
    })

  } catch (err) {
    next(err);
  }
}


export const createBookingCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const booking = await createBookingSV(req.body);
    res.status(201).json({
      status: 'SUCCESS',
      data: booking
    })

  } catch (err) {
    next(err);
  }
}


export const updateBookingCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const { id } = req.params;
    const booking = await updateBookingSV(id, req.body);
    res.status(201).json({
      status: 'SUCCESS',
      data: booking
    })

  } catch (err) {
    next(err);
  }
}