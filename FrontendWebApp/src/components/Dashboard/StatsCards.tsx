import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { clientApi, jobApi, driverApi, vehicleApi, transportApi } from '@/services/api';
import { Client, Job, Driver, Vehicle, Transport } from '@/types/api';

interface StatsData {
  totalClients: number;
  activeJobs: number;
  availableDrivers: number;
  activeVehicles: number;
  totalTransports: number;
}

interface StatsCardsProps {
  onCardClick: (tabKey: string) => void;
  refreshTrigger?: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ onCardClick, refreshTrigger = 0 }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clients, jobs, drivers, vehicles, transports] = await Promise.all([
        clientApi.getAll().catch(() => [] as Client[]),
        jobApi.getAll().catch(() => [] as Job[]),
        driverApi.getAll().catch(() => [] as Driver[]),
        vehicleApi.getAll().catch(() => [] as Vehicle[]),
        transportApi.getAll().catch(() => [] as Transport[]),
      ]);

      const activeJobs = jobs.filter(
        (job) => job.status !== undefined
      ).length;

      const availableDrivers = drivers.filter(
        (driver) => driver.status === 0 // Available
      ).length;

      const activeVehicles = vehicles.filter(
        (vehicle) => vehicle.state === 0 || vehicle.state === 1 || vehicle.state === 2 // Operational, Assigned, InTransit
      ).length;

      setStats({
        totalClients: clients.length,
        activeJobs,
        availableDrivers,
        activeVehicles,
        totalTransports: transports.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading statistics: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: '👥',
      color: 'primary',
      bgClass: 'bg-primary',
      tabKey: 'clients',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: '📋',
      color: 'success',
      bgClass: 'bg-success',
      tabKey: 'jobs',
    },
    {
      title: 'Available Drivers',
      value: stats.availableDrivers,
      icon: '🚗',
      color: 'info',
      bgClass: 'bg-info',
      tabKey: 'drivers',
    },
    {
      title: 'Active Vehicles',
      value: stats.activeVehicles,
      icon: '🚛',
      color: 'warning',
      bgClass: 'bg-warning',
      tabKey: 'vehicles',
    },
    {
      title: 'Total Transports',
      value: stats.totalTransports,
      icon: '📦',
      color: 'secondary',
      bgClass: 'bg-secondary',
      tabKey: 'transports',
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {statCards.map((stat, index) => (
        <Col key={index} xs={12} sm={6} lg={4} xl={2.4}>
          <Card
            className="h-100 shadow-sm border-0 stats-card"
            onClick={() => onCardClick(stat.tabKey)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="d-flex align-items-center">
              <div className={`${stat.bgClass} text-white rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                {stat.icon}
              </div>
              <div className="flex-grow-1">
                <Card.Title className="mb-0 fs-6 text-muted">{stat.title}</Card.Title>
                <Card.Text className="mb-0 fs-3 fw-bold">{stat.value}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;

