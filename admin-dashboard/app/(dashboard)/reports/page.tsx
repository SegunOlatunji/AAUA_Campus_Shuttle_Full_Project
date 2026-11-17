'use client';

import { Card } from '../../../components/ui/Card';
import { useReports } from '../../../hooks/useReports';
import { useRoutes } from '../../../hooks/useRoutes';

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-xs text-textSecondary">{label}</p>
      <p className="mt-2 text-2xl font-medium text-textPrimary">{value}</p>
      {hint && <p className="mt-1 text-xs text-textSecondary">{hint}</p>}
    </Card>
  );
}

export default function ReportsPage() {
  const { metrics, loading } = useReports();
  const { routes } = useRoutes();

  const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? id;
  const maxCount = Math.max(1, ...metrics.tripsByRoute.map((r) => r.count));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-textPrimary">Reports</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Evidence for Objective 3 — how much the system actually reduces wait time and how
          accurate its shuttle matching is.
        </p>
      </div>

      {loading && <p className="text-sm text-textSecondary">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Average wait time"
          value={
            metrics.averageActualWaitMinutes !== null
              ? `${metrics.averageActualWaitMinutes.toFixed(1)} min`
              : '—'
          }
          hint={`From ${metrics.completedMatchRequests} completed match${metrics.completedMatchRequests === 1 ? '' : 'es'}`}
        />
        <KpiCard
          label="Matching accuracy"
          value={
            metrics.averageEstimateErrorMinutes !== null
              ? `±${metrics.averageEstimateErrorMinutes.toFixed(1)} min`
              : '—'
          }
          hint="Average difference between estimated and actual arrival"
        />
        <KpiCard label="Trips today" value={String(metrics.tripsToday)} />
        <KpiCard label="Total trips logged" value={String(metrics.totalTrips)} />
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-textPrimary">Trips by route</h2>
        {metrics.tripsByRoute.length === 0 && (
          <p className="text-sm text-textSecondary">No completed trips logged yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {metrics.tripsByRoute.map((row) => (
            <div key={row.routeId} className="flex items-center gap-3">
              <span className="w-48 shrink-0 truncate text-xs text-textSecondary">
                {routeName(row.routeId)}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-textPrimary">{row.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-textPrimary">Student satisfaction</h2>
        <p className="text-2xl font-medium text-textPrimary">
          {metrics.averageFeedbackRating !== null ? `${metrics.averageFeedbackRating.toFixed(1)} / 5` : 'No ratings yet'}
        </p>
        <p className="mt-1 text-xs text-textSecondary">
          From {metrics.feedbackCount} student feedback submission{metrics.feedbackCount === 1 ? '' : 's'}
        </p>
      </Card>
    </div>
  );
}
