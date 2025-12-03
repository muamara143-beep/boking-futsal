import { NextRequest } from 'next/server';
import { bookingEmitter, BOOKING_EVENTS } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
      
      // Handler untuk booking baru
      const newBookingHandler = (booking: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'new_booking', booking })}\n\n`)
        );
      };
      
      // Handler untuk booking yang diupdate
      const updatedBookingHandler = (booking: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'booking_updated', booking })}\n\n`)
        );
      };
      
      // Register event listeners
      bookingEmitter.on(BOOKING_EVENTS.NEW_BOOKING, newBookingHandler);
      bookingEmitter.on(BOOKING_EVENTS.BOOKING_UPDATED, updatedBookingHandler);
      
      // Keep-alive ping setiap 30 detik
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);
      
      // Cleanup saat connection ditutup
      request.signal.addEventListener('abort', () => {
        bookingEmitter.off(BOOKING_EVENTS.NEW_BOOKING, newBookingHandler);
        bookingEmitter.off(BOOKING_EVENTS.BOOKING_UPDATED, updatedBookingHandler);
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
