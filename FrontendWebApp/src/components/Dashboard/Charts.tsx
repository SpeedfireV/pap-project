import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jobApi, vehicleApi, transportApi } from '@/services/api';
import { Job, Vehicle, Transport, JobStatus, VehicleType, VehicleState, TransportStatus } from '@/types/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Charts: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsData, vehiclesData, transportsData] = await Promise.all([
          jobApi.getAll().catch(() => []),
          vehicleApi.getAll().catch(() => []),
          transportApi.getAll().catch(() => []),
        ]);
        setJobs(jobsData);
        setVehicles(vehiclesData);
        setTransports(transportsData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Prepare Jobs by Status data
  const jobsByStatus = [
    { name: 'Normal', value: jobs.filter(j => j.status === JobStatus.Normal).length },
    { name: 'Express', value: jobs.filter(j => j.status === JobStatus.Express).length },
    { name: 'ADR', value: jobs.filter(j => j.status === JobStatus.Adr).length },
    { name: 'Towing', value: jobs.filter(j => j.status === JobStatus.Towing).length },
  ].filter(item => item.value > 0);

  // Prepare Vehicle Type distribution
  const vehicleTypeData = [
    { name: 'Van', value: vehicles.filter(v => v.type === VehicleType.Van).length },
    { name: 'Rigid Truck', value: vehicles.filter(v => v.type === VehicleType.RigidTruck).length },
    { name: 'Tractor Trailer', value: vehicles.filter(v => v.type === VehicleType.TractorTrailer).length },
    { name: 'Refrigerated', value: vehicles.filter(v => v.type === VehicleType.Refrigerated).length },
    { name: 'Tanker', value: vehicles.filter(v => v.type === VehicleType.Tanker).length },
    { name: 'Flatbed', value: vehicles.filter(v => v.type === VehicleType.Flatbed).length },
  ].filter(item => item.value > 0);

  // Prepare Vehicle State distribution
  const vehicleStateData = [
    { name: 'Operational', value: vehicles.filter(v => v.state === VehicleState.Operational).length },
    { name: 'Assigned', value: vehicles.filter(v => v.state === VehicleState.Assigned).length },
    { name: 'In Transit', value: vehicles.filter(v => v.state === VehicleState.InTransit).length },
    { name: 'In Depot', value: vehicles.filter(v => v.state === VehicleState.InDepot).length },
    { name: 'Maintenance', value: vehicles.filter(v => v.state === VehicleState.UnderMaintenance || v.state === VehicleState.MaintenanceScheduled).length },
    { name: 'Broken Down', value: vehicles.filter(v => v.state === VehicleState.BrokenDown).length },
    { name: 'Retired', value: vehicles.filter(v => v.state === VehicleState.Retired).length },
  ].filter(item => item.value > 0);

  // Prepare Transport Status distribution
  const transportStatusData = [
    { name: 'Booking Confirmed', value: transports.filter(t => t.status === TransportStatus.BookingConfirmed).length },
    { name: 'Pickup Scheduled', value: transports.filter(t => t.status === TransportStatus.PickupScheduled).length },
    { name: 'Loading', value: transports.filter(t => t.status === TransportStatus.Loading).length },
    { name: 'In Transit', value: transports.filter(t => t.status === TransportStatus.InTransit).length },
    { name: 'Unloading', value: transports.filter(t => t.status === TransportStatus.Unloading).length },
    { name: 'Delivered', value: transports.filter(t => t.status === TransportStatus.Delivered).length },
    { name: 'Completed', value: transports.filter(t => t.status === TransportStatus.Completed).length },
    { name: 'Exception', value: transports.filter(t => t.status === TransportStatus.Exception).length },
    { name: 'Canceled', value: transports.filter(t => t.status === TransportStatus.Canceled).length },
  ].filter(item => item.value > 0);

  return (
    <Row className="g-4 mb-4">
      <Col xs={12} lg={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-0 fs-5">Jobs by Status</Card.Title>
          </Card.Header>
          <Card.Body>
            {jobsByStatus.length === 0 ? (
              <div className="text-center text-muted py-4">No job data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} lg={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-0 fs-5">Vehicle Types</Card.Title>
          </Card.Header>
          <Card.Body>
            {vehicleTypeData.length === 0 ? (
              <div className="text-center text-muted py-4">No vehicle data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} lg={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-0 fs-5">Vehicle States</Card.Title>
          </Card.Header>
          <Card.Body>
            {vehicleStateData.length === 0 ? (
              <div className="text-center text-muted py-4">No vehicle data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleStateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} lg={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-0 fs-5">Transport Status</Card.Title>
          </Card.Header>
          <Card.Body>
            {transportStatusData.length === 0 ? (
              <div className="text-center text-muted py-4">No transport data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transportStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Charts;

