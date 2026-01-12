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

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Client API
export const clientApi = {
  getAll: (): Promise<Client[]> => fetchApi<Client[]>('/api/Client'),
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
  getAll: (): Promise<Job[]> => fetchApi<Job[]>('/api/Job'),
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
  getAll: (): Promise<Driver[]> => fetchApi<Driver[]>('/api/Driver'),
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
  getAll: (): Promise<Vehicle[]> => fetchApi<Vehicle[]>('/api/Vehicle'),
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
  getAll: (): Promise<Transport[]> => fetchApi<Transport[]>('/api/Transport'),
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
  getAll: (): Promise<Route[]> => fetchApi<Route[]>('/api/Route'),
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
};

// Export error class for use in components
export { ApiError };

// Error API
export const errorTicketApi = {
  getAll: (): Promise<ErrorTicket[]> => fetchApi<ErrorTicket[]>('/api/ErrorTicket'),
  getById: (id: number): Promise<ErrorTicket> => fetchApi<ErrorTicket>(`/api/ErrorTicket/${id}`),
  create: (dto: CreateErrorTicketDto): Promise<ErrorTicket> =>
    fetchApi<ErrorTicket>('/api/ErrorTicket', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  delete: (id: number): Promise<void> =>
    fetchApi<void>(`/api/ErrorTicket/${id}`, { method: 'DELETE' }),
};
