import { NextRequest, NextResponse } from 'next/server';
import { addBooking, getBookings } from '@/lib/db';
import { bookingEmitter, BOOKING_EVENTS } from '@/lib/events';

export async function GET() {
  try {
    const bookings = getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi
    const { lapangan, tanggal, jamMulai, jamSelesai, nama, noHp, email } = body;
    
    if (!lapangan || !tanggal || !jamMulai || !jamSelesai || !nama || !noHp || !email) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }
    
    const newBooking = addBooking({
      lapangan,
      tanggal,
      jamMulai,
      jamSelesai,
      nama,
      noHp,
      email,
    });
    
    // Emit event untuk notifikasi real-time
    bookingEmitter.emit(BOOKING_EVENTS.NEW_BOOKING, newBooking);
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
