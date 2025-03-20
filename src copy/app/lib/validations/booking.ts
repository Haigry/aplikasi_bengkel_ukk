import * as z from 'zod';

export const bookingSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  date: z.string().refine((date: string | number | Date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate >= today;
  }, { message: 'Tanggal tidak boleh kurang dari hari ini' }),
  message: z.string().min(10, { message: 'Mohon tulis keterangan dengan minimal 10 karakter' }),
});

export type BookingInput = z.infer<typeof bookingSchema>;
