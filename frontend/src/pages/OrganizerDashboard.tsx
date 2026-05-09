import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Link } from 'react-router-dom';

export const OrganizerDashboard = () => {
  return (
    <Container>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Link to="/organizer/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Events</h3>
          <p className="text-3xl font-bold">0</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Tickets Sold</h3>
          <p className="text-3xl font-bold">0</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$0</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        <div className="text-center py-8 text-gray-500">
          No events yet. Create your first event to get started!
        </div>
      </Card>
    </Container>
  );
};
