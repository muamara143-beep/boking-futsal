import { EventEmitter } from 'events';

export const bookingEmitter = new EventEmitter();
bookingEmitter.setMaxListeners(100);

export const BOOKING_EVENTS = {
  NEW_BOOKING: 'new_booking',
  BOOKING_UPDATED: 'booking_updated',
};
