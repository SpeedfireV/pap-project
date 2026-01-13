import { useEffect, useState } from 'react';
import { Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { jobApi, transportApi } from '@/services/api';
import { Job, Transport, JobStatus, TransportStatus } from '@/types/api';

interface ActivityItem {
  id: number;
  type: 'job' | 'transport';
  title: string;
  description: string;
  date: string;
  status: JobStatus | TransportStatus;
}

interface RecentActivityProps {
  refreshTrigger?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const [jobs, transports] = await Promise.all([
          jobApi.getAll().catch(() => [] as Job[]),
          transportApi.getAll().catch(() => [] as Transport[]),
        ]);

        const jobActivities: ActivityItem[] = jobs
          .slice(0, 5)
          .map((job) => ({
            id: job.jobId,
            type: 'job',
            title: `Job #${job.jobId}`,
            description: `Client ID: ${job.clientId} - ${job.remarks || 'No remarks'}`,
            date: job.date,
            status: job.status,
          }));

        const transportActivities: ActivityItem[] = transports
          .slice(0, 5)
          .map((transport) => ({
            id: transport.transportId,
            type: 'transport',
            title: `Transport #${transport.transportId}`,
            description: `Job: ${transport.jobId} | Vehicle: ${transport.vehicleId} | Driver: ${transport.driverId}`,
            date: transport.startDate,
            status: transport.status,
          }));

        // Combine and sort by date (most recent first)
        const allActivities = [...jobActivities, ...transportActivities].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setActivities(allActivities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [refreshTrigger]);

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

  const getTransportStatusBadge = (status: TransportStatus) => {
    const statusMap: Record<number, { variant: string; label: string }> = {
      1: { variant: 'info', label: 'Booking' },
      2: { variant: 'primary', label: 'Scheduled' },
      3: { variant: 'warning', label: 'Loading' },
      4: { variant: 'success', label: 'In Transit' },
      5: { variant: 'info', label: 'Stop' },
      6: { variant: 'primary', label: 'Delivery' },
      7: { variant: 'warning', label: 'Unloading' },
      8: { variant: 'success', label: 'Delivered' },
      9: { variant: 'success', label: 'Completed' },
      10: { variant: 'danger', label: 'Exception' },
      11: { variant: 'dark', label: 'Canceled' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0 h-100">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-0 fs-5">Recent Activity</Card.Title>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white border-bottom">
        <Card.Title className="mb-0 fs-5">Recent Activity</Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        {activities.length === 0 ? (
          <div className="text-center text-muted py-4">No recent activity</div>
        ) : (
          <ListGroup variant="flush">
            {activities.map((activity) => (
              <ListGroup.Item
                key={`${activity.type}-${activity.id}`}
                className="d-flex justify-content-between align-items-start border-0 border-bottom"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-bold me-2">{activity.title}</span>
                    {activity.type === 'job'
                      ? getJobStatusBadge(activity.status as JobStatus)
                      : getTransportStatusBadge(activity.status as TransportStatus)}
                  </div>
                  <small className="text-muted d-block">{activity.description}</small>
                  <small className="text-muted">{formatDate(activity.date)}</small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentActivity;

