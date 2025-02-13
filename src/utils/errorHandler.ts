import { toast } from 'react-hot-toast';

export const handleError = (_error: Error, customMessage?: string): void => {
  toast.error(customMessage || 'An error occurred');
};

export const logError = (_error: Error): void => {
  // Add logging logic here if needed
};
