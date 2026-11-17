'use client';

import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useShuttles } from '../../hooks/useShuttles';
import { useDrivers } from '../../hooks/useDrivers';
import { useReports } from '../../hooks/useReports';

export default function OverviewPage() {
  const { shuttles, loading: shuttlesLoading } = useShuttles();
  const { drivers } = useDrivers();
  const { metrics } = useReports();

  const activeShuttles = shuttles.filter((s) => s.tripStatus === 'in_progress');
  const pendingDrivers = drivers.filter((d) => d.approvalStatus === 'pending');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-textPrimary">Overview</h1>
        <p className="mt-1 text-sm text-textSecondary">What's happening on campus right now.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-textSecondary">Shuttles on trip now</p>
          <p className="mt-2 text-2xl font-medium text-textPrimary">
            {shuttlesLoading ? '—' : activeShuttles.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-textSecondary">Trips today</p>
          <p className="mt-2 text-2xl font-medium text-textPrimary">{metrics.tripsToday}</p>
        </Card>
        <Card>
          <p className="text-xs text-textSecondary">Average wait time</p>
          <p className="mt-2 text-2xl font-medium text-textPrimary">
            {metrics.averageActualWaitMinutes !== null
              ? `${metrics.averageActualWaitMinutes.toFixed(1)} min`
              : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-textSecondary">Drivers awaiting review</p>
          <p className="mt-2 text-2xl font-medium text-textPrimary">{pendingDrivers.length}</p>
          {pendingDrivers.length > 0 && (
            <Link href="/drivers" className="mt-1 inline-block text-xs font-medium text-primary">
              Review now
            </Link>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-textPrimary">Active shuttles</h2>
        </div>
        {activeShuttles.length === 0 && (
          <p className="text-sm text-textSecondary">No shuttle is currently on a trip.</p>
        )}
        {activeShuttles.map((shuttle) => (
          <div
            key={shuttle.id}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-textPrimary">{shuttle.plateNumber}</p>
              <p className="text-xs text-textSecondary">
                {shuttle.currentLocation
                  ? `Last update ${new Date(shuttle.currentLocation.updatedAt).toLocaleTimeString()}`
                  : 'Waiting for GPS…'}
              </p>
            </div>
            <Badge tone={shuttle.availableSeats === 0 ? 'danger' : 'success'}>
              {shuttle.availableSeats}/{shuttle.capacity} seats
            </Badge>
          </div>
        ))}
        <p className="mt-4 text-xs text-textSecondary">
          A live map view (plotting these positions visually rather than as a list) is a natural
          next enhancement — this list already has everything the map would need, once you're
          ready to add it.
        </p>
      </Card>
    </div>
  );
}
