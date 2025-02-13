import { getSession } from 'next-auth/react';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Add session token if exists
    ...(session?.user && { 'Authorization': `Bearer ${session.user.id}` })
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

// Example API functions using fetchWithAuth
export const api = {
  // Booking related
  createBooking: async (data: any) => {
    return fetchWithAuth('/api/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // User related
  getUserProfile: async () => {
    return fetchWithAuth('/api/user/profile');
  },

  // Service related
  getServices: async () => {
    return fetchWithAuth('/api/services');
  },

  // ... other existing API calls
};
