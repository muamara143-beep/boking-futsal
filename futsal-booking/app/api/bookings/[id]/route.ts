import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/db';
import { bookingEmitter, BOOKING_EVENTS } from '@/lib/events';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    const updatedBooking = updateBookingStatus(params.id, status);
    
    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Emit event untuk notifikasi real-time
    bookingEmitter.emit(BOOKING_EVENTS.BOOKING_UPDATED, updatedBooking);
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
