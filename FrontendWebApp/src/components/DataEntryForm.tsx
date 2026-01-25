import { Form, Button, Alert, Card, Tabs, Tab, Row, Col } from "react-bootstrap";
import { useState, FormEvent, useEffect, useMemo, useRef } from "react";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../contexts/AuthContext';
import {
  clientApi,
  jobApi,
  driverApi,
  vehicleApi,
  transportApi,
  routeApi,
  ApiError
} from '../services/api';
import {
  CreateClientDto,
  CreateJobDto,
  CreateDriverDto,
  CreateVehicleDto,
  CreateTransportDto,
  CreateRouteDto,
  JobStatus,
  DriverStatus,
  VehicleState,
  VehicleType,
  TransportStatus
} from '@/types/api';

// Define TypeScript types for react-select options
interface SelectOption {
  value: number;
  label: string;
  isLoadMore?: boolean;
}

// Custom styles for react-select to match Bootstrap
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#86b7fe' : '#adb5bd',
    },
    minHeight: '38px',
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
  }),
    option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.data?.isLoadMore 
      ? '#f8f9fa' 
      : state.isSelected 
        ? '#0d6efd' 
        : state.isFocused 
          ? '#f8f9fa' 
          : 'white',
    color: state.data?.isLoadMore 
      ? '#0d6efd' 
      : state.isSelected 
        ? 'white' 
        : '#212529',
    fontWeight: state.data?.isLoadMore ? '500' : 'normal',
    cursor: state.data?.isLoadMore ? 'pointer' : 'default',
    '&:active': {
      backgroundColor: state.data?.isLoadMore ? '#e9ecef' : state.isSelected ? '#0d6efd' : '#e9ecef',
    },
  }),
};

// Pagination constants
const INITIAL_PAGE_SIZE = 10; // Initial number of items to load
const EXPAND_PAGE_SIZE = 20; // Additional items to load when expanding

const DataEntryForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('client');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for form data
  const [clients, setClients] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);

  // State to trigger refresh of dropdowns
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState({
    clients: 0,
    jobs: 0,
    drivers: 0,
    vehicles: 0,
    transports: 0
  });

  // Cache for fetched data to avoid redundant API calls
  const dataCacheRef = useRef<{
    clients: Map<number, any>;
    jobs: Map<number, any>;
    drivers: Map<number, any>;
    vehicles: Map<number, any>;
    transports: Map<number, any>;
  }>({
    clients: new Map(),
    jobs: new Map(),
    drivers: new Map(),
    vehicles: new Map(),
    transports: new Map()
  });

  // Ref to store loaded data IDs (not full objects)
  const loadedDataRef = useRef<{
    clientIds: number[];
    jobIds: number[];
    driverIds: number[];
    vehicleIds: number[];
    transportIds: number[];
  }>({
    clientIds: [],
    jobIds: [],
    driverIds: [],
    vehicleIds: [],
    transportIds: []
  });

  // Form states
  const [clientForm, setClientForm] = useState<CreateClientDto>({
    name: '',
    nip: 0,
    address: '',
    phone: 0
  });
  
  const [jobForm, setJobForm] = useState<CreateJobDto>({
    clientId: 0,
    date: new Date().toISOString().split('T')[0],
    status: JobStatus.Normal,
    remarks: ''
  });
  
  const [driverForm, setDriverForm] = useState<CreateDriverDto>({
    name: '',
    surname: '',
    licenseNumber: 0,
    phone: 0,
    status: DriverStatus.Available
  });
  
  const [vehicleForm, setVehicleForm] = useState<CreateVehicleDto>({
    licensePlate: '',
    type: VehicleType.Van,
    capacity: 0,
    state: VehicleState.Operational
  });
  
  const [transportForm, setTransportForm] = useState<CreateTransportDto>({
    jobId: 0,
    vehicleId: 0,
    driverId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    cargoMass: 0,
    status: TransportStatus.BookingConfirmed
  });
  
  const [routeForm, setRouteForm] = useState<CreateRouteDto>({
    transportId: 0,
    startPoint: '',
    endPoint: '',
    distance: 0,
    estimatedTime: '00:00:00'
  });

  // Function to fetch initial data with correct pagination
  const fetchInitialData = async (type: 'clients' | 'jobs' | 'drivers' | 'vehicles' | 'transports') => {
    try {
      let data: any[] = [];
      let lastId = -1;
      
      switch (type) {
        case 'clients':
          data = await clientApi.getAll(-1, INITIAL_PAGE_SIZE);
          loadedDataRef.current.clientIds = data.map(item => item.clientId);
          data.forEach(item => dataCacheRef.current.clients.set(item.clientId, item));
          break;
        case 'jobs':
          data = await jobApi.getAll(-1, INITIAL_PAGE_SIZE);
          loadedDataRef.current.jobIds = data.map(item => item.jobId);
          data.forEach(item => dataCacheRef.current.jobs.set(item.jobId, item));
          break;
        case 'drivers':
          data = await driverApi.getAll(-1, INITIAL_PAGE_SIZE);
          loadedDataRef.current.driverIds = data.map(item => item.driverId);
          data.forEach(item => dataCacheRef.current.drivers.set(item.driverId, item));
          break;
        case 'vehicles':
          data = await vehicleApi.getAll(-1, INITIAL_PAGE_SIZE);
          loadedDataRef.current.vehicleIds = data.map(item => item.vehicleId);
          data.forEach(item => dataCacheRef.current.vehicles.set(item.vehicleId, item));
          break;
        case 'transports':
          data = await transportApi.getAll(-1, INITIAL_PAGE_SIZE);
          loadedDataRef.current.transportIds = data.map(item => item.transportId);
          data.forEach(item => dataCacheRef.current.transports.set(item.transportId, item));
          break;
      }
      
      return data;
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      return [];
    }
  };

  // Function to load more data with correct pagination
  const loadMoreData = async (type: 'clients' | 'jobs' | 'drivers' | 'vehicles' | 'transports') => {
    try {
      // Get the last ID from current loaded data
      let lastId = -1;
      let currentIds: number[] = [];
      
      switch (type) {
        case 'clients':
          currentIds = loadedDataRef.current.clientIds;
          lastId = currentIds.length > 0 ? Math.max(...currentIds) : -1;
          break;
        case 'jobs':
          currentIds = loadedDataRef.current.jobIds;
          lastId = currentIds.length > 0 ? Math.max(...currentIds) : -1;
          break;
        case 'drivers':
          currentIds = loadedDataRef.current.driverIds;
          lastId = currentIds.length > 0 ? Math.max(...currentIds) : -1;
          break;
        case 'vehicles':
          currentIds = loadedDataRef.current.vehicleIds;
          lastId = currentIds.length > 0 ? Math.max(...currentIds) : -1;
          break;
        case 'transports':
          currentIds = loadedDataRef.current.transportIds;
          lastId = currentIds.length > 0 ? Math.max(...currentIds) : -1;
          break;
      }
      
      let newData: any[] = [];
      
      switch (type) {
        case 'clients':
          newData = await clientApi.getAll(lastId, EXPAND_PAGE_SIZE);
          if (newData.length > 0) {
            const newIds = newData.map(item => item.clientId);
            loadedDataRef.current.clientIds = [...loadedDataRef.current.clientIds, ...newIds];
            newData.forEach(item => dataCacheRef.current.clients.set(item.clientId, item));
          }
          break;
        case 'jobs':
          newData = await jobApi.getAll(lastId, EXPAND_PAGE_SIZE);
          if (newData.length > 0) {
            const newIds = newData.map(item => item.jobId);
            loadedDataRef.current.jobIds = [...loadedDataRef.current.jobIds, ...newIds];
            newData.forEach(item => dataCacheRef.current.jobs.set(item.jobId, item));
          }
          break;
        case 'drivers':
          newData = await driverApi.getAll(lastId, EXPAND_PAGE_SIZE);
          if (newData.length > 0) {
            const newIds = newData.map(item => item.driverId);
            loadedDataRef.current.driverIds = [...loadedDataRef.current.driverIds, ...newIds];
            newData.forEach(item => dataCacheRef.current.drivers.set(item.driverId, item));
          }
          break;
        case 'vehicles':
          newData = await vehicleApi.getAll(lastId, EXPAND_PAGE_SIZE);
          if (newData.length > 0) {
            const newIds = newData.map(item => item.vehicleId);
            loadedDataRef.current.vehicleIds = [...loadedDataRef.current.vehicleIds, ...newIds];
            newData.forEach(item => dataCacheRef.current.vehicles.set(item.vehicleId, item));
          }
          break;
        case 'transports':
          newData = await transportApi.getAll(lastId, EXPAND_PAGE_SIZE);
          if (newData.length > 0) {
            const newIds = newData.map(item => item.transportId);
            loadedDataRef.current.transportIds = [...loadedDataRef.current.transportIds, ...newIds];
            newData.forEach(item => dataCacheRef.current.transports.set(item.transportId, item));
          }
          break;
      }
      
      if (newData.length > 0) {
        // Trigger refresh for this dropdown type
        setDropdownRefreshKey(prev => ({
          ...prev,
          [type]: prev[type] + 1
        }));
        
        return true;
      } else {
        // No more data available
        return false;
      }
    } catch (err) {
      console.error(`Error loading more ${type}:`, err);
      return false;
    }
  };

  // Helper function to get client name for job dropdown
  const getClientNameForJob = async (clientId: number): Promise<string> => {
    // Check cache first
    if (dataCacheRef.current.clients.has(clientId)) {
      return dataCacheRef.current.clients.get(clientId).name;
    }
    
    // Fetch from API
    try {
      const client = await clientApi.getById(clientId);
      dataCacheRef.current.clients.set(clientId, client);
      return client.name;
    } catch (err) {
      console.error(`Error fetching client ${clientId}:`, err);
      return 'Unknown Client';
    }
  };

  // Helper function to get vehicle info for transport dropdown
  const getVehicleInfoForTransport = async (vehicleId: number): Promise<{licensePlate: string, type: string}> => {
    // Check cache first
    if (dataCacheRef.current.vehicles.has(vehicleId)) {
      const vehicle = dataCacheRef.current.vehicles.get(vehicleId);
      return {
        licensePlate: vehicle.licensePlate,
        type: VehicleType[vehicle.type] || 'Unknown'
      };
    }
    
    // Fetch from API
    try {
      const vehicle = await vehicleApi.getById(vehicleId);
      dataCacheRef.current.vehicles.set(vehicleId, vehicle);
      return {
        licensePlate: vehicle.licensePlate,
        type: VehicleType[vehicle.type] || 'Unknown'
      };
    } catch (err) {
      console.error(`Error fetching vehicle ${vehicleId}:`, err);
      return {
        licensePlate: 'Unknown',
        type: 'Unknown'
      };
    }
  };

  // Async load functions for dropdowns
  const loadClientOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      // Load initial data if not loaded
      if (loadedDataRef.current.clientIds.length === 0) {
        await fetchInitialData('clients');
      }
      
      // Get all loaded client IDs
      const clientIds = loadedDataRef.current.clientIds;
      
      // Filter based on input value
      let filteredIds = clientIds;
      if (inputValue) {
        filteredIds = clientIds.filter(clientId => {
          const client = dataCacheRef.current.clients.get(clientId);
          if (!client) return false;
          return (
            client.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            client.nip.toString().includes(inputValue)
          );
        });
      }
      
      // Create options from filtered IDs
      const optionsPromises = filteredIds.map(async (clientId) => {
        const client = dataCacheRef.current.clients.get(clientId);
        if (client) {
          return {
            value: clientId,
            label: `${client.name} (NIP: ${client.nip})`
          };
        } else {
          // Fetch if not in cache
          try {
            const fetchedClient = await clientApi.getById(clientId);
            dataCacheRef.current.clients.set(clientId, fetchedClient);
            return {
              value: clientId,
              label: `${fetchedClient.name} (NIP: ${fetchedClient.nip})`
            };
          } catch (err) {
            console.error(`Error fetching client ${clientId}:`, err);
            return {
              value: clientId,
              label: `Client #${clientId} (Error loading)`
            };
          }
        }
      });
      
      const options = await Promise.all(optionsPromises) as SelectOption[];
      
      // Add "Load More" option if we have data
      if (options.length > 0) {
        options.push({
          value: -1,
          label: `Load more clients`,
          isLoadMore: true
        });
      }
      
      return options;
    } catch (err) {
      console.error('Error loading clients:', err);
      return [];
    }
  };

  const loadJobOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      // Load initial data if not loaded
      if (loadedDataRef.current.jobIds.length === 0) {
        await fetchInitialData('jobs');
      }
      
      // Get all loaded job IDs
      const jobIds = loadedDataRef.current.jobIds;
      
      // Filter based on input value
      let filteredIds = jobIds;
      if (inputValue) {
        filteredIds = jobIds.filter(jobId => {
          const job = dataCacheRef.current.jobs.get(jobId);
          if (!job) return false;
          return (
            job.jobId.toString().includes(inputValue) ||
            job.date.includes(inputValue)
          );
        });
      }
      
      // Create options from filtered IDs
      const optionsPromises = filteredIds.map(async (jobId) => {
        const job = dataCacheRef.current.jobs.get(jobId);
        let clientName = 'Unknown Client';
        
        if (job) {
          // Get client name
          clientName = await getClientNameForJob(job.clientId);
          return {
            value: jobId,
            label: `Job #${job.jobId} - ${clientName} - ${job.startDate}`
          };
        } else {
          // Fetch job if not in cache
          try {
            const fetchedJob = await jobApi.getById(jobId);
            dataCacheRef.current.jobs.set(jobId, fetchedJob);
            
            // Get client name
            clientName = await getClientNameForJob(fetchedJob.clientId);
            return {
              value: jobId,
              label: `Job #${fetchedJob.jobId} - ${clientName} - ${fetchedJob.startDate}`
            };
          } catch (err) {
            console.error(`Error fetching job ${jobId}:`, err);
            return {
              value: jobId,
              label: `Job #${jobId} (Error loading)`
            };
          }
        }
      });
      
      const options = await Promise.all(optionsPromises) as SelectOption[];
      
      // Add "Load More" option if we have data
      if (options.length > 0) {
        options.push({
          value: -1,
          label: `Load more jobs`,
          isLoadMore: true
        });
      }
      
      return options;
    } catch (err) {
      console.error('Error loading jobs:', err);
      return [];
    }
  };

  const loadDriverOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      // Load initial data if not loaded
      if (loadedDataRef.current.driverIds.length === 0) {
        await fetchInitialData('drivers');
      }
      
      // Get all loaded driver IDs
      const driverIds = loadedDataRef.current.driverIds;
      
      // Filter based on input value
      let filteredIds = driverIds;
      if (inputValue) {
        filteredIds = driverIds.filter(driverId => {
          const driver = dataCacheRef.current.drivers.get(driverId);
          if (!driver) return false;
          return (
            driver.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            driver.surname.toLowerCase().includes(inputValue.toLowerCase()) ||
            driver.licenseNumber.toString().includes(inputValue)
          );
        });
      }
      
      // Create options from filtered IDs
      const optionsPromises = filteredIds.map(async (driverId) => {
        const driver = dataCacheRef.current.drivers.get(driverId);
        if (driver) {
          return {
            value: driverId,
            label: `${driver.name} ${driver.surname} (${DriverStatus[driver.status] || 'Unknown'})`
          };
        } else {
          // Fetch if not in cache
          try {
            const fetchedDriver = await driverApi.getById(driverId);
            dataCacheRef.current.drivers.set(driverId, fetchedDriver);
            return {
              value: driverId,
              label: `${fetchedDriver.name} ${fetchedDriver.surname} (${DriverStatus[fetchedDriver.status] || 'Unknown'})`
            };
          } catch (err) {
            console.error(`Error fetching driver ${driverId}:`, err);
            return {
              value: driverId,
              label: `Driver #${driverId} (Error loading)`
            };
          }
        }
      });
      
      const options = await Promise.all(optionsPromises) as SelectOption[];
      
      // Add "Load More" option if we have data
      if (options.length > 0) {
        options.push({
          value: -1,
          label: `Load more drivers`,
          isLoadMore: true
        });
      }
      
      return options;
    } catch (err) {
      console.error('Error loading drivers:', err);
      return [];
    }
  };

  const loadVehicleOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      // Load initial data if not loaded
      if (loadedDataRef.current.vehicleIds.length === 0) {
        await fetchInitialData('vehicles');
      }
      
      // Get all loaded vehicle IDs
      const vehicleIds = loadedDataRef.current.vehicleIds;
      
      // Filter based on input value
      let filteredIds = vehicleIds;
      if (inputValue) {
        filteredIds = vehicleIds.filter(vehicleId => {
          const vehicle = dataCacheRef.current.vehicles.get(vehicleId);
          if (!vehicle) return false;
          return (
            vehicle.licensePlate.toLowerCase().includes(inputValue.toLowerCase()) ||
            VehicleType[vehicle.type]?.toLowerCase().includes(inputValue.toLowerCase())
          );
        });
      }
      
      // Create options from filtered IDs
      const optionsPromises = filteredIds.map(async (vehicleId) => {
        const vehicle = dataCacheRef.current.vehicles.get(vehicleId);
        if (vehicle) {
          return {
            value: vehicleId,
            label: `${vehicle.licensePlate} - ${VehicleType[vehicle.type] || 'Unknown'} (${VehicleState[vehicle.state] || 'Unknown'})`
          };
        } else {
          // Fetch if not in cache
          try {
            const fetchedVehicle = await vehicleApi.getById(vehicleId);
            dataCacheRef.current.vehicles.set(vehicleId, fetchedVehicle);
            return {
              value: vehicleId,
              label: `${fetchedVehicle.licensePlate} - ${VehicleType[fetchedVehicle.type] || 'Unknown'} (${VehicleState[fetchedVehicle.state] || 'Unknown'})`
            };
          } catch (err) {
            console.error(`Error fetching vehicle ${vehicleId}:`, err);
            return {
              value: vehicleId,
              label: `Vehicle #${vehicleId} (Error loading)`
            };
          }
        }
      });
      
      const options = await Promise.all(optionsPromises) as SelectOption[];
      
      // Add "Load More" option if we have data
      if (options.length > 0) {
        options.push({
          value: -1,
          label: `Load more vehicles`,
          isLoadMore: true
        });
      }
      
      return options;
    } catch (err) {
      console.error('Error loading vehicles:', err);
      return [];
    }
  };

  const loadTransportOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      // Load initial data if not loaded
      if (loadedDataRef.current.transportIds.length === 0) {
        await fetchInitialData('transports');
      }
      
      // Get all loaded transport IDs
      const transportIds = loadedDataRef.current.transportIds;
      
      // Filter based on input value
      let filteredIds = transportIds;
      if (inputValue) {
        filteredIds = transportIds.filter(transportId => {
          const transport = dataCacheRef.current.transports.get(transportId);
          if (!transport) return false;
          return (
            transport.transportId.toString().includes(inputValue) ||
            transport.jobId.toString().includes(inputValue)
          );
        });
      }
      
      // Create options from filtered IDs
      const optionsPromises = filteredIds.map(async (transportId) => {
        const transport = dataCacheRef.current.transports.get(transportId);
        
        if (transport) {
          // Get vehicle info
          const vehicleInfo = await getVehicleInfoForTransport(transport.vehicleId);
          return {
            value: transportId,
            label: `Transport #${transport.transportId} - Job: ${transport.jobId} - ${vehicleInfo.licensePlate}`
          };
        } else {
          // Fetch transport if not in cache
          try {
            const fetchedTransport = await transportApi.getById(transportId);
            dataCacheRef.current.transports.set(transportId, fetchedTransport);
            
            // Get vehicle info
            const vehicleInfo = await getVehicleInfoForTransport(fetchedTransport.vehicleId);
            return {
              value: transportId,
              label: `Transport #${fetchedTransport.transportId} - Job: ${fetchedTransport.jobId} - ${vehicleInfo.licensePlate}`
            };
          } catch (err) {
            console.error(`Error fetching transport ${transportId}:`, err);
            return {
              value: transportId,
              label: `Transport #${transportId} (Error loading)`
            };
          }
        }
      });
      
      const options = await Promise.all(optionsPromises) as SelectOption[];
      
      // Add "Load More" option if we have data
      if (options.length > 0) {
        options.push({
          value: -1,
          label: `Load more transports`,
          isLoadMore: true
        });
      }
      
      return options;
    } catch (err) {
      console.error('Error loading transports:', err);
      return [];
    }
  };

  // Status enum options
  const jobStatusOptions: SelectOption[] = Object.entries(JobStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  const driverStatusOptions: SelectOption[] = Object.entries(DriverStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  const vehicleTypeOptions: SelectOption[] = Object.entries(VehicleType)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  const vehicleStateOptions: SelectOption[] = Object.entries(VehicleState)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  const transportStatusOptions: SelectOption[] = Object.entries(TransportStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  // Handler for dropdown selection with Load More support
  const handleDropdownChange = (
    selected: SelectOption | null,
    setForm: React.Dispatch<React.SetStateAction<any>>,
    fieldName: string,
    type: 'clients' | 'jobs' | 'drivers' | 'vehicles' | 'transports'
  ) => {
    if (!selected) {
      setForm((prev: any) => ({ ...prev, [fieldName]: 0 }));
      return;
    }

    // Check if this is a "Load More" option
    if (selected.isLoadMore) {
      // Load more data and don't change the selection
      loadMoreData(type);
      return;
    }

    // Regular selection
    setForm((prev: any) => ({ ...prev, [fieldName]: selected.value }));
  };

  // Load initial data for basic maps
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load a few records for basic data
        const [clientsData, driversData, vehiclesData] = await Promise.all([
          clientApi.getAll(-1, 20),
          driverApi.getAll(-1, 20),
          vehicleApi.getAll(-1, 20)
        ]);
        
        // Store in cache
        clientsData.forEach(client => dataCacheRef.current.clients.set(client.clientId, client));
        driversData.forEach(driver => dataCacheRef.current.drivers.set(driver.driverId, driver));
        vehiclesData.forEach(vehicle => dataCacheRef.current.vehicles.set(vehicle.vehicleId, vehicle));
        
        // Also update loaded IDs for dropdowns
        loadedDataRef.current.clientIds = clientsData.map(c => c.clientId);
        loadedDataRef.current.driverIds = driversData.map(d => d.driverId);
        loadedDataRef.current.vehicleIds = vehiclesData.map(v => v.vehicleId);
        
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    
    loadInitialData();
  }, []);

  // Reset loaded data when form is reset or tab changes
  useEffect(() => {
    // Clear loaded data ref when tab changes
    loadedDataRef.current = {
      clientIds: [],
      jobIds: [],
      driverIds: [],
      vehicleIds: [],
      transportIds: []
    };
    
    // Clear cache
    dataCacheRef.current = {
      clients: new Map(),
      jobs: new Map(),
      drivers: new Map(),
      vehicles: new Map(),
      transports: new Map()
    };
    
    setDropdownRefreshKey({
      clients: 0,
      jobs: 0,
      drivers: 0,
      vehicles: 0,
      transports: 0
    });
  }, [activeTab]);

  const handleClientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await clientApi.create(clientForm);
      setSuccess('Client added successfully!');
      setClientForm({ name: '', nip: 0, address: '', phone: 0 });
      // Refresh client data
      const updatedClients = await clientApi.getAll(-1, 20);
      dataCacheRef.current.clients.clear();
      updatedClients.forEach(client => dataCacheRef.current.clients.set(client.clientId, client));
      loadedDataRef.current.clientIds = updatedClients.map(c => c.clientId);
    } catch (err) {
      handleError(err, 'client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await jobApi.create(jobForm);
      setSuccess('Job added successfully!');
      setJobForm({
        clientId: 0,
        date: new Date().toISOString().split('T')[0],
        status: JobStatus.Normal,
        remarks: ''
      });
      // Refresh job data
      const updatedJobs = await jobApi.getAll(-1, 20);
      dataCacheRef.current.jobs.clear();
      updatedJobs.forEach(job => dataCacheRef.current.jobs.set(job.jobId, job));
      loadedDataRef.current.jobIds = updatedJobs.map(j => j.jobId);
    } catch (err) {
      handleError(err, 'job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await driverApi.create(driverForm);
      setSuccess('Driver added successfully!');
      setDriverForm({
        name: '',
        surname: '',
        licenseNumber: 0,
        phone: 0,
        status: DriverStatus.Available
      });
      // Refresh driver data
      const updatedDrivers = await driverApi.getAll(-1, 20);
      dataCacheRef.current.drivers.clear();
      updatedDrivers.forEach(driver => dataCacheRef.current.drivers.set(driver.driverId, driver));
      loadedDataRef.current.driverIds = updatedDrivers.map(d => d.driverId);
    } catch (err) {
      handleError(err, 'driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await vehicleApi.create(vehicleForm);
      setSuccess('Vehicle added successfully!');
      setVehicleForm({
        licensePlate: '',
        type: VehicleType.Van,
        capacity: 0,
        state: VehicleState.Operational
      });
      // Refresh vehicle data
      const updatedVehicles = await vehicleApi.getAll(-1, 20);
      dataCacheRef.current.vehicles.clear();
      updatedVehicles.forEach(vehicle => dataCacheRef.current.vehicles.set(vehicle.vehicleId, vehicle));
      loadedDataRef.current.vehicleIds = updatedVehicles.map(v => v.vehicleId);
    } catch (err) {
      handleError(err, 'vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const newTransport = await transportApi.create(transportForm);
      setSuccess('Transport added successfully!');
      setTransportForm({
        jobId: 0,
        vehicleId: 0,
        driverId: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        cargoMass: 0,
        status: TransportStatus.BookingConfirmed
      });
      // Refresh transport data
      const updatedTransports = await transportApi.getAll(-1, 20);
      dataCacheRef.current.transports.clear();
      updatedTransports.forEach(transport => dataCacheRef.current.transports.set(transport.transportId, transport));
      loadedDataRef.current.transportIds = updatedTransports.map(t => t.transportId);
    } catch (err) {
      handleError(err, 'transport');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRouteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await routeApi.create(routeForm);
      setSuccess('Route added successfully!');
      setRouteForm({
        transportId: 0,
        startPoint: '',
        endPoint: '',
        distance: 0,
        estimatedTime: '00:00:00'
      });
      // Refresh transport data
      const updatedTransports = await transportApi.getAll(-1, 20);
      dataCacheRef.current.transports.clear();
      updatedTransports.forEach(transport => dataCacheRef.current.transports.set(transport.transportId, transport));
      loadedDataRef.current.transportIds = updatedTransports.map(t => t.transportId);
    } catch (err) {
      handleError(err, 'route');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (err: any, entity: string) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        setError(`Unauthorized - Please log in to add ${entity}s`);
      } else {
        setError(`Failed to add ${entity}: ${err.message}`);
      }
    } else {
      setError(`Failed to add ${entity}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Helper function to get current value for dropdown with proper data fetching
  const getDropdownValue = async (id: number, type: 'clients' | 'jobs' | 'drivers' | 'vehicles' | 'transports'): Promise<SelectOption | null> => {
    if (!id) return null;
    
    try {
      switch (type) {
        case 'clients':
          const client = dataCacheRef.current.clients.get(id);
          if (client) {
            return { value: id, label: `${client.name} (NIP: ${client.nip})` };
          } else {
            const fetchedClient = await clientApi.getById(id);
            dataCacheRef.current.clients.set(id, fetchedClient);
            return { value: id, label: `${fetchedClient.name} (NIP: ${fetchedClient.nip})` };
          }
        case 'jobs':
          const job = dataCacheRef.current.jobs.get(id);
          if (job) {
            const clientName = await getClientNameForJob(job.clientId);
            return { value: id, label: `Job #${job.jobId} - ${clientName} - ${job.startDate}` };
          } else {
            const fetchedJob = await jobApi.getById(id);
            dataCacheRef.current.jobs.set(id, fetchedJob);
            const clientName = await getClientNameForJob(fetchedJob.clientId);
            return { value: id, label: `Job #${fetchedJob.jobId} - ${clientName} - ${fetchedJob.startDate}` };
          }
        case 'drivers':
          const driver = dataCacheRef.current.drivers.get(id);
          if (driver) {
            return { 
              value: id, 
              label: `${driver.name} ${driver.surname} (${DriverStatus[driver.status] || 'Unknown'})` 
            };
          } else {
            const fetchedDriver = await driverApi.getById(id);
            dataCacheRef.current.drivers.set(id, fetchedDriver);
            return { 
              value: id, 
              label: `${fetchedDriver.name} ${fetchedDriver.surname} (${DriverStatus[fetchedDriver.status] || 'Unknown'})` 
            };
          }
        case 'vehicles':
          const vehicle = dataCacheRef.current.vehicles.get(id);
          if (vehicle) {
            return { 
              value: id, 
              label: `${vehicle.licensePlate} - ${VehicleType[vehicle.type] || 'Unknown'} (${VehicleState[vehicle.state] || 'Unknown'})` 
            };
          } else {
            const fetchedVehicle = await vehicleApi.getById(id);
            dataCacheRef.current.vehicles.set(id, fetchedVehicle);
            return { 
              value: id, 
              label: `${fetchedVehicle.licensePlate} - ${VehicleType[fetchedVehicle.type] || 'Unknown'} (${VehicleState[fetchedVehicle.state] || 'Unknown'})` 
            };
          }
        case 'transports':
          const transport = dataCacheRef.current.transports.get(id);
          if (transport) {
            const vehicleInfo = await getVehicleInfoForTransport(transport.vehicleId);
            return { 
              value: id, 
              label: `Transport #${transport.transportId} - Job: ${transport.jobId} - ${vehicleInfo.licensePlate}` 
            };
          } else {
            const fetchedTransport = await transportApi.getById(id);
            dataCacheRef.current.transports.set(id, fetchedTransport);
            const vehicleInfo = await getVehicleInfoForTransport(fetchedTransport.vehicleId);
            return { 
              value: id, 
              label: `Transport #${fetchedTransport.transportId} - Job: ${fetchedTransport.jobId} - ${vehicleInfo.licensePlate}` 
            };
          }
        default:
          return null;
      }
    } catch (err) {
      console.error(`Error getting dropdown value for ${type} ${id}:`, err);
      return { value: id, label: `${type.slice(0, -1)} #${id} (Error loading)` };
    }
  };

  // State for dropdown values
  const [dropdownValues, setDropdownValues] = useState<{
    clients: Map<number, SelectOption>;
    jobs: Map<number, SelectOption>;
    drivers: Map<number, SelectOption>;
    vehicles: Map<number, SelectOption>;
    transports: Map<number, SelectOption>;
  }>({
    clients: new Map(),
    jobs: new Map(),
    drivers: new Map(),
    vehicles: new Map(),
    transports: new Map()
  });

  // Effect to load dropdown values when IDs change
  useEffect(() => {
    const loadDropdownValues = async () => {
      const newValues = { ...dropdownValues };
      
      // Load client values
      if (jobForm.clientId && !newValues.clients.has(jobForm.clientId)) {
        const value = await getDropdownValue(jobForm.clientId, 'clients');
        if (value) newValues.clients.set(jobForm.clientId, value);
      }
      
      // Load job values for transport form
      if (transportForm.jobId && !newValues.jobs.has(transportForm.jobId)) {
        const value = await getDropdownValue(transportForm.jobId, 'jobs');
        if (value) newValues.jobs.set(transportForm.jobId, value);
      }
      
      // Load driver values for transport form
      if (transportForm.driverId && !newValues.drivers.has(transportForm.driverId)) {
        const value = await getDropdownValue(transportForm.driverId, 'drivers');
        if (value) newValues.drivers.set(transportForm.driverId, value);
      }
      
      // Load vehicle values for transport form
      if (transportForm.vehicleId && !newValues.vehicles.has(transportForm.vehicleId)) {
        const value = await getDropdownValue(transportForm.vehicleId, 'vehicles');
        if (value) newValues.vehicles.set(transportForm.vehicleId, value);
      }
      
      // Load transport values for route form
      if (routeForm.transportId && !newValues.transports.has(routeForm.transportId)) {
        const value = await getDropdownValue(routeForm.transportId, 'transports');
        if (value) newValues.transports.set(routeForm.transportId, value);
      }
      
      setDropdownValues(newValues);
    };
    
    loadDropdownValues();
  }, [jobForm.clientId, transportForm.jobId, transportForm.driverId, transportForm.vehicleId, routeForm.transportId]);

  const resetForm = () => {
    setClientForm({ name: '', nip: 0, address: '', phone: 0 });
    setJobForm({
      clientId: 0,
      date: new Date().toISOString().split('T')[0],
      status: JobStatus.Normal,
      remarks: ''
    });
    setDriverForm({
      name: '',
      surname: '',
      licenseNumber: 0,
      phone: 0,
      status: DriverStatus.Available
    });
    setVehicleForm({
      licensePlate: '',
      type: VehicleType.Van,
      capacity: 0,
      state: VehicleState.Operational
    });
    setTransportForm({
      jobId: 0,
      vehicleId: 0,
      driverId: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      cargoMass: 0,
      status: TransportStatus.BookingConfirmed
    });
    setRouteForm({
      transportId: 0,
      startPoint: '',
      endPoint: '',
      distance: 0,
      estimatedTime: '00:00:00'
    });
    setError(null);
    setSuccess(null);
    
    // Clear all loaded data
    loadedDataRef.current = {
      clientIds: [],
      jobIds: [],
      driverIds: [],
      vehicleIds: [],
      transportIds: []
    };
    
    // Clear cache
    dataCacheRef.current = {
      clients: new Map(),
      jobs: new Map(),
      drivers: new Map(),
      vehicles: new Map(),
      transports: new Map()
    };
    
    // Reset refresh keys
    setDropdownRefreshKey({
      clients: 0,
      jobs: 0,
      drivers: 0,
      vehicles: 0,
      transports: 0
    });
    
    // Clear dropdown values
    setDropdownValues({
      clients: new Map(),
      jobs: new Map(),
      drivers: new Map(),
      vehicles: new Map(),
      transports: new Map()
    });
  };

  return (
    <Card>
      <Card.Header>
        <h3>Data Entry Form</h3>
        <p className="text-muted mb-0">Add new records to the database</p>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert variant="warning" className="mb-4">
            You need to be logged in to add data to the database.
          </Alert>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-4"
          fill
        >
          <Tab eventKey="client" title="Client">
            <Form onSubmit={handleClientSubmit} className="mt-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>NIP *</Form.Label>
                    <Form.Control
                      type="number"
                      value={clientForm.nip || ''}
                      onChange={(e) => setClientForm({...clientForm, nip: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Address *</Form.Label>
                <Form.Control
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                      type="number"
                      value={clientForm.phone || ''}
                      onChange={(e) => setClientForm({...clientForm, phone: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Client...' : 'Add Client'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="job" title="Job">
            <Form onSubmit={handleJobSubmit} className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>Client *</Form.Label>
                <AsyncSelect
                  key={`clients-${dropdownRefreshKey.clients}`} // Force re-render when data changes
                  cacheOptions
                  defaultOptions
                  loadOptions={loadClientOptions}
                  value={dropdownValues.clients.get(jobForm.clientId) || null}
                  onChange={(selected) => handleDropdownChange(selected, setJobForm, 'clientId', 'clients')}
                  isSearchable
                  isClearable
                  placeholder="Search or select a client..."
                  isDisabled={isSubmitting || !isAuthenticated}
                  styles={customSelectStyles}
                  noOptionsMessage={({ inputValue }) => 
                    inputValue ? `No clients found for "${inputValue}"` : "Start typing to search clients"
                  }
                  loadingMessage={() => "Loading clients..."}
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={jobForm.date}
                      onChange={(e) => setJobForm({...jobForm, date: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status *</Form.Label>
                    <Select
                      options={jobStatusOptions}
                      value={jobStatusOptions.find(opt => opt.value === jobForm.status)}
                      onChange={(selected) => setJobForm({...jobForm, status: selected?.value || JobStatus.Normal})}
                      isSearchable
                      isClearable
                      placeholder="Select status..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={jobForm.remarks}
                  onChange={(e) => setJobForm({...jobForm, remarks: e.target.value})}
                  disabled={isSubmitting || !isAuthenticated}
                />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Job...' : 'Add Job'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="driver" title="Driver">
            <Form onSubmit={handleDriverSubmit} className="mt-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={driverForm.surname}
                      onChange={(e) => setDriverForm({...driverForm, surname: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>License Number *</Form.Label>
                    <Form.Control
                      type="number"
                      value={driverForm.licenseNumber || ''}
                      onChange={(e) => setDriverForm({...driverForm, licenseNumber: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone *</Form.Label>
                    <Form.Control
                      type="number"
                      value={driverForm.phone || ''}
                      onChange={(e) => setDriverForm({...driverForm, phone: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Status *</Form.Label>
                <Select
                  options={driverStatusOptions}
                  value={driverStatusOptions.find(opt => opt.value === driverForm.status)}
                  onChange={(selected) => setDriverForm({...driverForm, status: selected?.value || DriverStatus.Available})}
                  isSearchable
                  isClearable
                  placeholder="Select status..."
                  isDisabled={isSubmitting || !isAuthenticated}
                  styles={customSelectStyles}
                />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Driver...' : 'Add Driver'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="vehicle" title="Vehicle">
            <Form onSubmit={handleVehicleSubmit} className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>License Plate *</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value.toUpperCase()})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                  placeholder="ABC 1234"
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Type *</Form.Label>
                    <Select
                      options={vehicleTypeOptions}
                      value={vehicleTypeOptions.find(opt => opt.value === vehicleForm.type)}
                      onChange={(selected) => setVehicleForm({...vehicleForm, type: selected?.value || VehicleType.Van})}
                      isSearchable
                      isClearable
                      placeholder="Select vehicle type..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacity (kg) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={vehicleForm.capacity || ''}
                      onChange={(e) => setVehicleForm({...vehicleForm, capacity: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Select
                  options={vehicleStateOptions}
                  value={vehicleStateOptions.find(opt => opt.value === vehicleForm.state)}
                  onChange={(selected) => setVehicleForm({...vehicleForm, state: selected?.value || VehicleState.Operational})}
                  isSearchable
                  isClearable
                  placeholder="Select vehicle state..."
                  isDisabled={isSubmitting || !isAuthenticated}
                  styles={customSelectStyles}
                />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="transport" title="Transport">
            <Form onSubmit={handleTransportSubmit} className="mt-3">
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job *</Form.Label>
                    <AsyncSelect
                      key={`jobs-${dropdownRefreshKey.jobs}`} // Force re-render when data changes
                      cacheOptions
                      defaultOptions
                      loadOptions={loadJobOptions}
                      value={dropdownValues.jobs.get(transportForm.jobId) || null}
                      onChange={(selected) => handleDropdownChange(selected, setTransportForm, 'jobId', 'jobs')}
                      isSearchable
                      isClearable
                      placeholder="Search or select a job..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                      noOptionsMessage={({ inputValue }) => 
                        inputValue ? `No jobs found for "${inputValue}"` : "Start typing to search jobs"
                      }
                      loadingMessage={() => "Loading jobs..."}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle *</Form.Label>
                    <AsyncSelect
                      key={`vehicles-${dropdownRefreshKey.vehicles}`} // Force re-render when data changes
                      cacheOptions
                      defaultOptions
                      loadOptions={loadVehicleOptions}
                      value={dropdownValues.vehicles.get(transportForm.vehicleId) || null}
                      onChange={(selected) => handleDropdownChange(selected, setTransportForm, 'vehicleId', 'vehicles')}
                      isSearchable
                      isClearable
                      placeholder="Search or select a vehicle..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                      noOptionsMessage={({ inputValue }) => 
                        inputValue ? `No vehicles found for "${inputValue}"` : "Start typing to search vehicles"
                      }
                      loadingMessage={() => "Loading vehicles..."}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Driver *</Form.Label>
                    <AsyncSelect
                      key={`drivers-${dropdownRefreshKey.drivers}`} // Force re-render when data changes
                      cacheOptions
                      defaultOptions
                      loadOptions={loadDriverOptions}
                      value={dropdownValues.drivers.get(transportForm.driverId) || null}
                      onChange={(selected) => handleDropdownChange(selected, setTransportForm, 'driverId', 'drivers')}
                      isSearchable
                      isClearable
                      placeholder="Search or select a driver..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                      noOptionsMessage={({ inputValue }) => 
                        inputValue ? `No drivers found for "${inputValue}"` : "Start typing to search drivers"
                      }
                      loadingMessage={() => "Loading drivers..."}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={transportForm.startDate}
                      onChange={(e) => setTransportForm({...transportForm, startDate: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={transportForm.endDate}
                      onChange={(e) => setTransportForm({...transportForm, endDate: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cargo Mass (kg) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={transportForm.cargoMass || ''}
                      onChange={(e) => setTransportForm({...transportForm, cargoMass: parseInt(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status *</Form.Label>
                    <Select
                      options={transportStatusOptions}
                      value={transportStatusOptions.find(opt => opt.value === transportForm.status)}
                      onChange={(selected) => setTransportForm({...transportForm, status: selected?.value || TransportStatus.BookingConfirmed})}
                      isSearchable
                      isClearable
                      placeholder="Select transport status..."
                      isDisabled={isSubmitting || !isAuthenticated}
                      styles={customSelectStyles}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Transport...' : 'Add Transport'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="route" title="Route">
            <Form onSubmit={handleRouteSubmit} className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>Transport *</Form.Label>
                <AsyncSelect
                  key={`transports-${dropdownRefreshKey.transports}`} // Force re-render when data changes
                  cacheOptions
                  defaultOptions
                  loadOptions={loadTransportOptions}
                  value={dropdownValues.transports.get(routeForm.transportId) || null}
                  onChange={(selected) => handleDropdownChange(selected, setRouteForm, 'transportId', 'transports')}
                  isSearchable
                  isClearable
                  placeholder="Search or select a transport..."
                  isDisabled={isSubmitting || !isAuthenticated}
                  styles={customSelectStyles}
                  noOptionsMessage={({ inputValue }) => 
                    inputValue ? `No transports found for "${inputValue}"` : "Start typing to search transports"
                  }
                  loadingMessage={() => "Loading transports..."}
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Point *</Form.Label>
                    <Form.Control
                      type="text"
                      value={routeForm.startPoint}
                      onChange={(e) => setRouteForm({...routeForm, startPoint: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                      placeholder="e.g., Warsaw, Poland"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Point *</Form.Label>
                    <Form.Control
                      type="text"
                      value={routeForm.endPoint}
                      onChange={(e) => setRouteForm({...routeForm, endPoint: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                      placeholder="e.g., Berlin, Germany"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Distance (km) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={routeForm.distance || ''}
                      onChange={(e) => setRouteForm({...routeForm, distance: parseFloat(e.target.value) || 0})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estimated Time (HH:mm:ss) *</Form.Label>
                    <Form.Control
                      type="text"
                      value={routeForm.estimatedTime}
                      onChange={(e) => setRouteForm({...routeForm, estimatedTime: e.target.value})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                      placeholder="00:00:00"
                    />
                    <Form.Text className="text-muted">
                      Format: HH:mm:ss (e.g., 04:30:00 for 4 hours 30 minutes)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Route...' : 'Add Route'}
              </Button>
            </Form>
          </Tab>
        </Tabs>

        <div className="mt-4 pt-3 border-top d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Clear All Forms
          </Button>
          
          <div className="text-muted">
            <small>
              {isAuthenticated 
                ? 'You are logged in and can add data' 
                : 'Please log in to enable data entry'}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DataEntryForm;