import { useEffect, useState } from 'react';
import { Table, Tabs, Tab, Spinner, Badge, Button, Alert, Toast, ToastContainer, Modal } from 'react-bootstrap';
import { clientApi, jobApi, driverApi, vehicleApi, transportApi } from '@/services/api';
import { Client, Job, Driver, Vehicle, Transport, JobStatus, DriverStatus, VehicleState, VehicleType, TransportStatus } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

interface DataTablesProps {
  activeTab: string;
  onTabChange: (k: string) => void;
  onDataChange?: () => void;
}

const DataTables: React.FC<DataTablesProps> = ({ activeTab, onTabChange, onDataChange }) => {
  const { isAuthenticated, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ [key: string]: number | null }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    type: 'client' | 'job' | 'driver' | 'vehicle' | 'transport';
    deleteFunction: (id: number) => Promise<void>;
    stateSetter: React.Dispatch<React.SetStateAction<any[]>>;
  } | null>(null);

  const fetchAllData = async () => {
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showAuthRequiredModal = (
    id: number,
    type: 'client' | 'job' | 'driver' | 'vehicle' | 'transport',
    deleteFunction: (id: number) => Promise<void>,
    stateSetter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setPendingDelete({ id, type, deleteFunction, stateSetter });
    setShowAuthModal(true);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;

    const { id, type, deleteFunction, stateSetter } = pendingDelete;
    
    setDeleting(prev => ({ ...prev, [type]: id }));
    
    try {
      await deleteFunction(id);
      
      // Update local state immediately
      stateSetter(prev => prev.filter(item => {
        const idKey = `${type}Id` as keyof any;
        return item[idKey as keyof typeof item] !== id;
      }));
      
      // Show success message
      showSuccessToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);

      // Notify parent component that data has changed
      if (onDataChange) {
        onDataChange();
      }
      
      // Optionally refresh related data if needed
      if (type === 'client') {
        try {
          const updatedJobs = await jobApi.getAll();
          setJobs(updatedJobs);
        } catch (err) {
          console.error('Failed to refresh jobs:', err);
        }
      }
      
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        setError('Unauthorized - Your session may have expired. Please log in again.');
      } else {
        setError(`Failed to delete ${type}. Please try again.`);
      }
      
      // Refresh all data to ensure consistency
      fetchAllData();
    } finally {
      setDeleting(prev => ({ ...prev, [type]: null }));
      setPendingDelete(null);
      setShowAuthModal(false);
    }
  };

  const handleDelete = (
    id: number,
    type: 'client' | 'job' | 'driver' | 'vehicle' | 'transport',
    deleteFunction: (id: number) => Promise<void>,
    stateSetter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (!isAuthenticated) {
      showAuthRequiredModal(id, type, deleteFunction, stateSetter);
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    // If authenticated, proceed with deletion
    setDeleting(prev => ({ ...prev, [type]: id }));
    
    const performDelete = async () => {
      try {
        await deleteFunction(id);
        
        // Update local state immediately
        stateSetter(prev => prev.filter(item => {
          const idKey = `${type}Id` as keyof any;
          return item[idKey as keyof typeof item] !== id;
        }));
        
        // Show success message
        showSuccessToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);

        // Notify parent component that data has changed
        if (onDataChange) {
          onDataChange();
        }
        
        // Optionally refresh related data if needed
        if (type === 'client') {
          try {
            const updatedJobs = await jobApi.getAll();
            setJobs(updatedJobs);
          } catch (err) {
            console.error('Failed to refresh jobs:', err);
          }
        }
        
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          setError('Unauthorized - Your session may have expired. Please log in again.');
        } else {
          setError(`Failed to delete ${type}. Please try again.`);
        }
        
        // Refresh all data to ensure consistency
        fetchAllData();
      } finally {
        setDeleting(prev => ({ ...prev, [type]: null }));
      }
    };

    performDelete();
  };

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
      {/* Authentication Required Modal */}
      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Authentication Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="bi bi-shield-lock text-warning" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Login Required</h5>
            <p>You need to be logged in to perform deletion operations.</p>
            <p className="text-muted small">
              Deleting records requires proper authorization to maintain data integrity.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuthModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            setShowAuthModal(false);
            // Optionally redirect to login page
            // window.location.href = '/login';
          }}>
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          bg="success" 
          autohide
          delay={3000}
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Tabs activeKey={activeTab} onSelect={(k) => onTabChange(k || 'clients')} className="mb-0">
          <Tab eventKey="clients" title={`Clients (${clients.length})`} />
          <Tab eventKey="jobs" title={`Jobs (${jobs.length})`} />
          <Tab eventKey="drivers" title={`Drivers (${drivers.length})`} />
          <Tab eventKey="vehicles" title={`Vehicles (${vehicles.length})`} />
          <Tab eventKey="transports" title={`Transports (${transports.length})`} />
        </Tabs>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={fetchAllData}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Refresh All'}
        </Button>
      </div>

      {activeTab === 'clients' && (
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
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(
                          client.clientId,
                          'client',
                          clientApi.delete,
                          setClients
                        )}
                        disabled={deleting.client === client.clientId}
                        title={isAuthenticated ? "Delete client" : "Login to delete"}
                      >
                        {deleting.client === client.clientId ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            {isAuthenticated ? ' Delete' : ' Login Required'}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {activeTab === 'jobs' && (
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
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(
                          job.jobId,
                          'job',
                          jobApi.delete,
                          setJobs
                        )}
                        disabled={deleting.job === job.jobId}
                        title={isAuthenticated ? "Delete job" : "Login to delete"}
                      >
                        {deleting.job === job.jobId ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            {isAuthenticated ? ' Delete' : ' Login Required'}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {activeTab === 'drivers' && (
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
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(
                          driver.driverId,
                          'driver',
                          driverApi.delete,
                          setDrivers
                        )}
                        disabled={deleting.driver === driver.driverId}
                        title={isAuthenticated ? "Delete driver" : "Login to delete"}
                      >
                        {deleting.driver === driver.driverId ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            {isAuthenticated ? ' Delete' : ' Login Required'}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {activeTab === 'vehicles' && (
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
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(
                          vehicle.vehicleId,
                          'vehicle',
                          vehicleApi.delete,
                          setVehicles
                        )}
                        disabled={deleting.vehicle === vehicle.vehicleId}
                        title={isAuthenticated ? "Delete vehicle" : "Login to delete"}
                      >
                        {deleting.vehicle === vehicle.vehicleId ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            {isAuthenticated ? ' Delete' : ' Login Required'}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {activeTab === 'transports' && (
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
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(
                          transport.transportId,
                          'transport',
                          transportApi.delete,
                          setTransports
                        )}
                        disabled={deleting.transport === transport.transportId}
                        title={isAuthenticated ? "Delete transport" : "Login to delete"}
                      >
                        {deleting.transport === transport.transportId ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            {isAuthenticated ? ' Delete' : ' Login Required'}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DataTables;