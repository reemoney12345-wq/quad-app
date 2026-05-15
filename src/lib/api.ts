const API_BASE = 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('quad-token');
  }
  return null;
};

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge custom headers
  if (options.headers) {
    const customHeaders = options.headers as Record<string, string>;
    Object.assign(headers, customHeaders);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiFetch<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch<any>('/auth/me'),
};

// Locations API
export const locationsAPI = {
  getAll: (search?: string) =>
    apiFetch<any[]>(`/locations${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getById: (id: string) => apiFetch<any>(`/locations/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: (filters?: { building?: string; status?: string; minCapacity?: number }) => {
    const params = new URLSearchParams();
    if (filters?.building) params.append('building', filters.building);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minCapacity) params.append('minCapacity', filters.minCapacity.toString());
    const query = params.toString();
    return apiFetch<any[]>(`/rooms${query ? `?${query}` : ''}`);
  },

  updateStatus: (id: string, data: { status: string; until?: string }) =>
    apiFetch<any>(`/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Updates API
export const updatesAPI = {
  getAll: (category?: string) =>
    apiFetch<any[]>(`/updates${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  create: (data: { category: string; location: string; message: string }) =>
    apiFetch<any>('/updates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify: (id: string) =>
    apiFetch<any>(`/updates/${id}/verify`, {
      method: 'POST',
    }),
};

// Lost & Found API
export const itemsAPI = {
  getAll: (type?: 'lost' | 'found') =>
    apiFetch<any[]>(`/items${type ? `?type=${type}` : ''}`),

  create: (formData: FormData) => {
    const token = getToken();
    return fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create item');
      return res.json();
    });
  },

  claim: (id: string) =>
    apiFetch<any>(`/items/${id}/claim`, {
      method: 'PATCH',
    }),
};