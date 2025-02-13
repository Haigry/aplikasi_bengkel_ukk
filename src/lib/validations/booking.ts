import { z } from 'zod';

export const bookingSchema = z.object({
  date: z.string()
    .min(1, 'Tanggal harus diisi')
    .refine((date) => {
      const selectedDate = new Date(date);
      return !isNaN(selectedDate.getTime());
    }, 'Format tanggal tidak valid'),
  message: z.string()
    .min(10, 'Pesan minimal 10 karakter')
    .max(500, 'Pesan maksimal 500 karakter')
});

export type BookingInput = z.infer<typeof bookingSchema>;
