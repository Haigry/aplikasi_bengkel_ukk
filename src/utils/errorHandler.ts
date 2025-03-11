import { toast } from 'react-hot-toast';

export const handleError = (error: Error | unknown, message?: string) => {
  console.error(error);
  if (error instanceof Error) {
    toast.error(message || error.message);
  } else {
    toast.error(message || 'An unexpected error occurred');
  }
};

export const logError = (_error: Error): void => {
  // Add logging logic here if needed
};
