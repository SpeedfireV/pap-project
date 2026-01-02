// Type definitions matching backend models

export interface Client {
  clientId: number;
  name: string;
  nip: number;
  address: string;
  phone: number;
}

export interface Job {
  jobId: number;
  clientId: number;
  client?: Client;
  date: string; // DateOnly serialized as string
  status: JobStatus;
  remarks: string;
}

export interface Driver {
  driverId: number;
  name: string;
  surname: string;
  licenseNumber: number;
  phone: number;
  status: DriverStatus;
}

export interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  type: VehicleType;
  capacity: number;
  state: VehicleState;
}

export interface Transport {
  transportId: number;
  jobId: number;
  vehicleId: number;
  driverId: number;
  job?: Job;
  vehicle?: Vehicle;
  driver?: Driver;
  startDate: string; // DateOnly serialized as string
  endDate: string; // DateOnly serialized as string
  cargoMass: number;
  status: TransportStatus;
}

export interface Route {
  routeId: number;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: string; // TimeSpan serialized as string
}

export interface StatusHistory {
  statusHistoryId: number;
  jobId: number;
  userId: number;
  oldStatus: JobStatus;
  newStatus: JobStatus;
  changeDate: string; // DateTime serialized as string
}

// Enums
export enum JobStatus {
  Normal = 0,
  Express = 1,
  Adr = 2,
  Towing = 3
}

export enum DriverStatus {
  Available = 0,
  Planned = 1,
  Dispatched = 2,
  Loading = 3,
  InTransit = 4,
  OnBreak = 5,
  Unloading = 6,
  Deadheading = 7,
  OutOfService = 8,
  TimeOff = 9,
  Sick = 10,
  VehicleIssue = 11
}

export enum VehicleState {
  Operational = 0,
  Assigned = 1,
  InTransit = 2,
  InDepot = 3,
  MaintenanceScheduled = 4,
  UnderMaintenance = 5,
  BrokenDown = 6,
  Retired = 7
}

export enum VehicleType {
  Van = 0,
  RigidTruck = 1,
  TractorTrailer = 2,
  Refrigerated = 3,
  Tanker = 4,
  Flatbed = 5
}

export enum TransportStatus {
  BookingConfirmed = 1,
  PickupScheduled = 2,
  Loading = 3,
  InTransit = 4,
  AtIntermediateStop = 5,
  DeliveryScheduled = 6,
  Unloading = 7,
  Delivered = 8,
  Completed = 9,
  Exception = 10,
  Canceled = 11
}

// DTOs for creating entities
export interface CreateClientDto {
  name: string;
  nip: number;
  address: string;
  phone: number;
}

export interface CreateJobDto {
  clientId: number;
  date: string;
  status: JobStatus;
  remarks: string;
}

export interface CreateDriverDto {
  name: string;
  surname: string;
  licenseNumber: number;
  phone: number;
  status: DriverStatus;
}

export interface CreateVehicleDto {
  licensePlate: string;
  type: VehicleType;
  capacity: number;
  state: VehicleState;
}

export interface CreateTransportDto {
  jobId: number;
  vehicleId: number;
  driverId: number;
  startDate: string;
  endDate: string;
  cargoMass: number;
  status: TransportStatus;
}

export interface CreateRouteDto {
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: string;
}

export interface UpdateTransportDto {
  jobId?: number;
  vehicleId?: number;
  driverId?: number;
  startDate?: string;
  endDate?: string;
  cargoMass?: number;
  status?: TransportStatus;
}

