import { useEffect, useCallback } from 'react';

export function useDebounce(callback: () => void, delay: number) {
  const debouncedCallback = useCallback(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  useEffect(() => {
    return debouncedCallback();
  }, [debouncedCallback]);
}
