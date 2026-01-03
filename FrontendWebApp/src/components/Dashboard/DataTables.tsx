import { useEffect, useState } from 'react';
import { Table, Tabs, Tab, Spinner, Badge, Button, Alert } from 'react-bootstrap';
import { clientApi, jobApi, driverApi, vehicleApi, transportApi } from '@/services/api';
import { Client, Job, Driver, Vehicle, Transport, JobStatus, DriverStatus, VehicleState, VehicleType, TransportStatus } from '@/types/api';

const DataTables: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('clients');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [clientsData, jobsData, driversData, vehiclesData, transportsData] = await Promise.all([
          clientApi.getAll(),
          jobApi.getAll(),
          driverApi.getAll(),
          vehicleApi.getAll(),
          transportApi.getAll(),
        ]);
        setClients(clientsData);
        setJobs(jobsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setTransports(transportsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getJobStatusBadge = (status: JobStatus) => {
    const statusMap: Record<JobStatus, { variant: string; label: string }> = {
      [JobStatus.Normal]: { variant: 'primary', label: 'Normal' },
      [JobStatus.Express]: { variant: 'warning', label: 'Express' },
      [JobStatus.Adr]: { variant: 'danger', label: 'ADR' },
      [JobStatus.Towing]: { variant: 'info', label: 'Towing' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const getDriverStatusBadge = (status: DriverStatus) => {
    const statusMap: Record<number, { variant: string; label: string }> = {
      0: { variant: 'success', label: 'Available' },
      1: { variant: 'info', label: 'Planned' },
      2: { variant: 'primary', label: 'Dispatched' },
      3: { variant: 'warning', label: 'Loading' },
      4: { variant: 'primary', label: 'In Transit' },
      5: { variant: 'secondary', label: 'On Break' },
      6: { variant: 'warning', label: 'Unloading' },
      7: { variant: 'info', label: 'Deadheading' },
      8: { variant: 'danger', label: 'Out of Service' },
      9: { variant: 'secondary', label: 'Time Off' },
      10: { variant: 'danger', label: 'Sick' },
      11: { variant: 'warning', label: 'Vehicle Issue' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const getVehicleStateBadge = (state: VehicleState) => {
    const stateMap: Record<number, { variant: string; label: string }> = {
      0: { variant: 'success', label: 'Operational' },
      1: { variant: 'info', label: 'Assigned' },
      2: { variant: 'primary', label: 'In Transit' },
      3: { variant: 'secondary', label: 'In Depot' },
      4: { variant: 'warning', label: 'Maintenance Scheduled' },
      5: { variant: 'warning', label: 'Under Maintenance' },
      6: { variant: 'danger', label: 'Broken Down' },
      7: { variant: 'dark', label: 'Retired' },
    };
    const config = stateMap[state] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    const typeMap: Record<number, string> = {
      0: 'Van',
      1: 'Rigid Truck',
      2: 'Tractor Trailer',
      3: 'Refrigerated',
      4: 'Tanker',
      5: 'Flatbed',
    };
    return typeMap[type] || 'Unknown';
  };

  const getTransportStatusBadge = (status: TransportStatus) => {
    const statusMap: Record<number, { variant: string; label: string }> = {
      1: { variant: 'info', label: 'Booking Confirmed' },
      2: { variant: 'primary', label: 'Pickup Scheduled' },
      3: { variant: 'warning', label: 'Loading' },
      4: { variant: 'success', label: 'In Transit' },
      5: { variant: 'info', label: 'At Intermediate Stop' },
      6: { variant: 'primary', label: 'Delivery Scheduled' },
      7: { variant: 'warning', label: 'Unloading' },
      8: { variant: 'success', label: 'Delivered' },
      9: { variant: 'success', label: 'Completed' },
      10: { variant: 'danger', label: 'Exception' },
      11: { variant: 'dark', label: 'Canceled' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="data-tables-container">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'clients')} className="mb-3">
        <Tab eventKey="clients" title={`Clients (${clients.length})`}>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>NIP</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No clients found</td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.clientId}>
                      <td>{client.clientId}</td>
                      <td>{client.name}</td>
                      <td>{client.nip}</td>
                      <td>{client.address}</td>
                      <td>{client.phone}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this client?')) {
                            clientApi.delete(client.clientId).then(() => {
                              setClients(clients.filter(c => c.clientId !== client.clientId));
                            }).catch(console.error);
                          }
                        }}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="jobs" title={`Jobs (${jobs.length})`}>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No jobs found</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.jobId}>
                      <td>{job.jobId}</td>
                      <td>{job.clientId}</td>
                      <td>{job.date}</td>
                      <td>{getJobStatusBadge(job.status)}</td>
                      <td>{job.remarks}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this job?')) {
                            jobApi.delete(job.jobId).then(() => {
                              setJobs(jobs.filter(j => j.jobId !== job.jobId));
                            }).catch(console.error);
                          }
                        }}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="drivers" title={`Drivers (${drivers.length})`}>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>License Number</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">No drivers found</td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.driverId}>
                      <td>{driver.driverId}</td>
                      <td>{driver.name}</td>
                      <td>{driver.surname}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>{driver.phone}</td>
                      <td>{getDriverStatusBadge(driver.status)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this driver?')) {
                            driverApi.delete(driver.driverId).then(() => {
                              setDrivers(drivers.filter(d => d.driverId !== driver.driverId));
                            }).catch(console.error);
                          }
                        }}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="vehicles" title={`Vehicles (${vehicles.length})`}>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>License Plate</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No vehicles found</td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.vehicleId}>
                      <td>{vehicle.vehicleId}</td>
                      <td>{vehicle.licensePlate}</td>
                      <td>{getVehicleTypeLabel(vehicle.type)}</td>
                      <td>{vehicle.capacity}</td>
                      <td>{getVehicleStateBadge(vehicle.state)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this vehicle?')) {
                            vehicleApi.delete(vehicle.vehicleId).then(() => {
                              setVehicles(vehicles.filter(v => v.vehicleId !== vehicle.vehicleId));
                            }).catch(console.error);
                          }
                        }}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="transports" title={`Transports (${transports.length})`}>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job ID</th>
                  <th>Vehicle ID</th>
                  <th>Driver ID</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Cargo Mass</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">No transports found</td>
                  </tr>
                ) : (
                  transports.map((transport) => (
                    <tr key={transport.transportId}>
                      <td>{transport.transportId}</td>
                      <td>{transport.jobId}</td>
                      <td>{transport.vehicleId}</td>
                      <td>{transport.driverId}</td>
                      <td>{transport.startDate}</td>
                      <td>{transport.endDate}</td>
                      <td>{transport.cargoMass}</td>
                      <td>{getTransportStatusBadge(transport.status)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this transport?')) {
                            transportApi.delete(transport.transportId).then(() => {
                              setTransports(transports.filter(t => t.transportId !== transport.transportId));
                            }).catch(console.error);
                          }
                        }}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default DataTables;

