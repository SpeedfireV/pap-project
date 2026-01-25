import {
  Client,
  Job,
  Driver,
  Vehicle,
  Transport,
  Route,
  StatusHistory,
  CreateClientDto,
  CreateJobDto,
  CreateDriverDto,
  CreateVehicleDto,
  CreateTransportDto,
  CreateRouteDto,
  UpdateTransportDto,
  JobStatus,
  ErrorTicket,
  CreateErrorTicketDto
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5219';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper to handle 401 errors
const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    // Dispatch event that components can listen to
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

// Helper to determine if a request requires auth
const requiresAuth = (method: string = 'GET'): boolean => {
  // GET requests don't require auth, others do
  return method !== 'GET';
};

// In the fetchApi function, update the response handling:
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options?.method || 'GET';
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header only for non-GET requests
  if (requiresAuth(method)) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // For write operations without token, warn but still try
      console.warn('No auth token found for write operation');
    }
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        handleUnauthorized();
        throw new ApiError(response.status, 'Unauthorized - Please log in again');
      }
      
      // Handle other errors
      let errorMessage: string;
      try {
        const errorText = await response.text();
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    // Handle 204 No Content - DELETE operations often return empty response
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      // Return empty object for void operations
      return {} as T;
    }

    // Check if there's actually content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.warn('Failed to parse JSON response:', jsonError);
        // Return empty object if JSON parsing fails
        return {} as T;
      }
    } else {
      // For non-JSON responses, return text or empty
      const text = await response.text();
      // If there's text but not JSON, return it as a string
      if (text) {
        return text as unknown as T;
      }
      return {} as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to build query string for pagination
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Client API
export const clientApi = {
  getAll: (lastId?: number, amount?: number): Promise<Client[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Client[]>(`/api/Client${queryParams}`);
  },
  getById: (id: number): Promise<Client> => fetchApi<Client>(`/api/Client/${id}`),
  create: (dto: CreateClientDto): Promise<Client> =>
    fetchApi<Client>('/api/Client', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Client/${id}`, { method: 'DELETE' }),
};

// Job API
export const jobApi = {
  getAll: (lastId?: number, amount?: number): Promise<Job[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Job[]>(`/api/Job${queryParams}`);
  },
  getById: (id: number): Promise<Job> => fetchApi<Job>(`/api/Job/${id}`),
  create: (dto: CreateJobDto): Promise<Job> =>
    fetchApi<Job>('/api/Job', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Job/${id}`, { method: 'DELETE' }),
  updateStatus: (id: number, status: JobStatus, userId: number): Promise<void> =>
    fetchApi<void>(`/api/Job/${id}/status?userId=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    }),
};

// Driver API
export const driverApi = {
  getAll: (lastId?: number, amount?: number): Promise<Driver[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Driver[]>(`/api/Driver${queryParams}`);
  },
  getById: (id: number): Promise<Driver> => fetchApi<Driver>(`/api/Driver/${id}`),
  create: (dto: CreateDriverDto): Promise<Driver> =>
    fetchApi<Driver>('/api/Driver', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Driver/${id}`, { method: 'DELETE' }),
};

// Vehicle API
export const vehicleApi = {
  getAll: (lastId?: number, amount?: number): Promise<Vehicle[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Vehicle[]>(`/api/Vehicle${queryParams}`);
  },
  getById: (id: number): Promise<Vehicle> => fetchApi<Vehicle>(`/api/Vehicle/${id}`),
  create: (dto: CreateVehicleDto): Promise<Vehicle> =>
    fetchApi<Vehicle>('/api/Vehicle', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Vehicle/${id}`, { method: 'DELETE' }),
};

// Transport API
export const transportApi = {
  getAll: (lastId?: number, amount?: number): Promise<Transport[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Transport[]>(`/api/Transport${queryParams}`);
  },
  getById: (id: number): Promise<Transport> => fetchApi<Transport>(`/api/Transport/${id}`),
  create: (dto: CreateTransportDto): Promise<Transport> =>
    fetchApi<Transport>('/api/Transport', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: number, dto: UpdateTransportDto): Promise<Transport> =>
    fetchApi<Transport>(`/api/Transport/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Transport/${id}`, { method: 'DELETE' }),
};

// Route API
export const routeApi = {
  getAll: (lastId?: number, amount?: number): Promise<Route[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<Route[]>(`/api/Route${queryParams}`);
  },
  getById: (id: number): Promise<Route> => fetchApi<Route>(`/api/Route/${id}`),
  create: (dto: CreateRouteDto): Promise<Route> =>
    fetchApi<Route>('/api/Route', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Route/${id}`, { method: 'DELETE' }),
};

// Status History API
export const statusHistoryApi = {
  getByJob: (jobId: number): Promise<StatusHistory[]> =>
    fetchApi<StatusHistory[]>(`/api/StatusHistory/job/${jobId}`),
  getByJobPaged: (jobId: number, lastId?: number, amount?: number): Promise<StatusHistory[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<StatusHistory[]>(`/api/StatusHistory/job/${jobId}${queryParams}`);
  },
};

// Error API
export const errorTicketApi = {
  getAll: (lastId?: number, amount?: number): Promise<ErrorTicket[]> => {
    const queryParams = buildQueryString({ 
      lastId: lastId !== undefined ? lastId : -1,
      amount: amount !== undefined ? amount : 100 
    });
    return fetchApi<ErrorTicket[]>(`/api/Error${queryParams}`);
  },
  getById: (id: number): Promise<ErrorTicket> => fetchApi<ErrorTicket>(`/api/Error/${id}`),
  create: (dto: CreateErrorTicketDto): Promise<ErrorTicket> =>
    fetchApi<ErrorTicket>('/api/Error', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/Error/${id}`, { method: 'DELETE' }),
};

export { ApiError };