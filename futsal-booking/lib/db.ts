import fs from 'fs';
import path from 'path';

export interface Booking {
  id: string;
  lapangan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  nama: string;
  noHp: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const dbPath = path.join(process.cwd(), 'data', 'bookings.json');

export function getBookings(): Booking[] {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveBookings(bookings: Booking[]): void {
  fs.writeFileSync(dbPath, JSON.stringify(bookings, null, 2));
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
}

export function updateBookingStatus(id: string, status: 'approved' | 'rejected'): Booking | null {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index].status = status;
  saveBookings(bookings);
  return bookings[index];
}
