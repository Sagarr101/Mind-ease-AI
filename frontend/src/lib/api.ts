const getBackendUrl = (): string => {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // If accessed via non-loopback hostname, rewrite local backend targets to this host.
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '0.0.0.0') {
      const isEnvLocal = !envApiUrl || envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1') || envApiUrl.includes('0.0.0.0');
      if (isEnvLocal) {
        if (port === '3000') {
          return `${protocol}//${hostname}:5001`;
        }
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      }
    }
  }
  
  return envApiUrl || 'http://localhost:5001';
};

export const BACKEND_URL = getBackendUrl();


interface RequestOptions extends RequestInit {
  body?: any;
}

const getHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mindease_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },
};
