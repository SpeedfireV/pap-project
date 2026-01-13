import { Form, Button, Alert, Card, Tabs, Tab, Row, Col } from "react-bootstrap";
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import {
  clientApi,
  jobApi,
  driverApi,
  vehicleApi,
  transportApi,
  routeApi,
  errorTicketApi,
  ApiError
} from '../services/api';
import {
  CreateClientDto,
  CreateJobDto,
  CreateDriverDto,
  CreateVehicleDto,
  CreateTransportDto,
  CreateRouteDto,
  CreateErrorTicketDto,
  JobStatus,
  DriverStatus,
  VehicleState,
  VehicleType,
  TransportStatus
} from '@/types/api';

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
  
  // Form states
  const [clientForm, setClientForm] = useState<CreateClientDto>({
    name: '',
    nip: 0,
    address: '',
    phone: 0
  });
  
  const [jobForm, setJobForm] = useState<CreateJobDto>({
    clientId: 0,
    date: new Date().toISOString().split('T')[0], // Today's date as YYYY-MM-DD
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
    startPoint: '',
    endPoint: '',
    distance: 0,
    estimatedTime: '00:00:00'
  });
  
  const [errorTicketForm, setErrorTicketForm] = useState<CreateErrorTicketDto>({
    ticketName: '',
    ticketDescription: ''
  });

  // Load related data for dropdowns
  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        const [clientsData, driversData, vehiclesData, jobsData] = await Promise.all([
          clientApi.getAll(),
          driverApi.getAll(),
          vehicleApi.getAll(),
          jobApi.getAll()
        ]);
        
        setClients(clientsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setJobs(jobsData);
      } catch (err) {
        console.error('Failed to load related data:', err);
      }
    };
    
    loadRelatedData();
  }, []);

  const handleClientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await clientApi.create(clientForm);
      setSuccess('Client added successfully!');
      setClientForm({ name: '', nip: 0, address: '', phone: 0 });
      // Refresh clients list
      const updatedClients = await clientApi.getAll();
      setClients(updatedClients);
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
      // Refresh jobs list
      const updatedJobs = await jobApi.getAll();
      setJobs(updatedJobs);
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
      // Refresh drivers list
      const updatedDrivers = await driverApi.getAll();
      setDrivers(updatedDrivers);
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
      // Refresh vehicles list
      const updatedVehicles = await vehicleApi.getAll();
      setVehicles(updatedVehicles);
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
      await transportApi.create(transportForm);
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
        startPoint: '',
        endPoint: '',
        distance: 0,
        estimatedTime: '00:00:00'
      });
    } catch (err) {
      handleError(err, 'route');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorTicketSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await errorTicketApi.create(errorTicketForm);
      setSuccess('Error ticket added successfully!');
      setErrorTicketForm({
        ticketName: '',
        ticketDescription: ''
      });
    } catch (err) {
      handleError(err, 'error ticket');
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
      startPoint: '',
      endPoint: '',
      distance: 0,
      estimatedTime: '00:00:00'
    });
    setErrorTicketForm({
      ticketName: '',
      ticketDescription: ''
    });
    setError(null);
    setSuccess(null);
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
                <Form.Select
                  value={jobForm.clientId}
                  onChange={(e) => setJobForm({...jobForm, clientId: parseInt(e.target.value)})}
                  required
                  disabled={isSubmitting || !isAuthenticated || clients.length === 0}
                >
                  <option value={0}>Select a client</option>
                  {clients.map(client => (
                    <option key={client.clientId} value={client.clientId}>
                      {client.name} (NIP: {client.nip})
                    </option>
                  ))}
                </Form.Select>
                {clients.length === 0 && (
                  <Form.Text className="text-warning">
                    No clients available. Please add a client first.
                  </Form.Text>
                )}
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
                    <Form.Select
                      value={jobForm.status}
                      onChange={(e) => setJobForm({...jobForm, status: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    >
                      {Object.entries(JobStatus)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, value]) => (
                          <option key={key} value={value}>
                            {key}
                          </option>
                        ))}
                    </Form.Select>
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
                disabled={isSubmitting || !isAuthenticated || clients.length === 0}
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
                <Form.Select
                  value={driverForm.status}
                  onChange={(e) => setDriverForm({...driverForm, status: parseInt(e.target.value)})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                >
                  {Object.entries(DriverStatus)
                    .filter(([key]) => isNaN(Number(key)))
                    .map(([key, value]) => (
                      <option key={key} value={value}>
                        {key}
                      </option>
                    ))}
                </Form.Select>
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
                    <Form.Select
                      value={vehicleForm.type}
                      onChange={(e) => setVehicleForm({...vehicleForm, type: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    >
                      {Object.entries(VehicleType)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, value]) => (
                          <option key={key} value={value}>
                            {key}
                          </option>
                        ))}
                    </Form.Select>
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
                <Form.Select
                  value={vehicleForm.state}
                  onChange={(e) => setVehicleForm({...vehicleForm, state: parseInt(e.target.value)})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                >
                  {Object.entries(VehicleState)
                    .filter(([key]) => isNaN(Number(key)))
                    .map(([key, value]) => (
                      <option key={key} value={value}>
                        {key}
                      </option>
                    ))}
                </Form.Select>
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
                    <Form.Select
                      value={transportForm.jobId}
                      onChange={(e) => setTransportForm({...transportForm, jobId: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated || jobs.length === 0}
                    >
                      <option value={0}>Select a job</option>
                      {jobs.map(job => (
                        <option key={job.jobId} value={job.jobId}>
                          Job #{job.jobId} - {job.client?.name || 'Unknown Client'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle *</Form.Label>
                    <Form.Select
                      value={transportForm.vehicleId}
                      onChange={(e) => setTransportForm({...transportForm, vehicleId: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated || vehicles.length === 0}
                    >
                      <option value={0}>Select a vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                          {vehicle.licensePlate} ({VehicleType[vehicle.type]})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Driver *</Form.Label>
                    <Form.Select
                      value={transportForm.driverId}
                      onChange={(e) => setTransportForm({...transportForm, driverId: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated || drivers.length === 0}
                    >
                      <option value={0}>Select a driver</option>
                      {drivers.map(driver => (
                        <option key={driver.driverId} value={driver.driverId}>
                          {driver.name} {driver.surname}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Select
                      value={transportForm.status}
                      onChange={(e) => setTransportForm({...transportForm, status: parseInt(e.target.value)})}
                      required
                      disabled={isSubmitting || !isAuthenticated}
                    >
                      {Object.entries(TransportStatus)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, value]) => (
                          <option key={key} value={value}>
                            {key}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated || jobs.length === 0 || vehicles.length === 0 || drivers.length === 0}
              >
                {isSubmitting ? 'Adding Transport...' : 'Add Transport'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="route" title="Route">
            <Form onSubmit={handleRouteSubmit} className="mt-3">
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

          <Tab eventKey="error" title="Error Ticket">
            <Form onSubmit={handleErrorTicketSubmit} className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>Ticket Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={errorTicketForm.ticketName}
                  onChange={(e) => setErrorTicketForm({...errorTicketForm, ticketName: e.target.value})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                  placeholder="Brief description of the error"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={errorTicketForm.ticketDescription}
                  onChange={(e) => setErrorTicketForm({...errorTicketForm, ticketDescription: e.target.value})}
                  required
                  disabled={isSubmitting || !isAuthenticated}
                  placeholder="Detailed description of the error..."
                />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? 'Adding Error Ticket...' : 'Add Error Ticket'}
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