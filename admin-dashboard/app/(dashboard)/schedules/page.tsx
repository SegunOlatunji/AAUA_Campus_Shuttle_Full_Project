'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useSchedules, type ScheduleFormInput } from '../../../hooks/useSchedules';
import { useRoutes } from '../../../hooks/useRoutes';
import { useShuttles } from '../../../hooks/useShuttles';
import { useDrivers } from '../../../hooks/useDrivers';
import { WEEKDAYS, type ScheduleRecord } from '../../../lib/types/schedule';

function ScheduleEditor({
  schedule,
  onSave,
  onCancel,
}: {
  schedule: ScheduleRecord | null;
  onSave: (id: string | null, input: ScheduleFormInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { routes } = useRoutes();
  const { shuttles } = useShuttles();
  const { drivers } = useDrivers();
  const approvedDrivers = drivers.filter((d) => d.approvalStatus === 'approved');

  const [routeId, setRouteId] = useState(schedule?.routeId ?? '');
  const [shuttleId, setShuttleId] = useState(schedule?.shuttleId ?? '');
  const [driverId, setDriverId] = useState(schedule?.driverId ?? '');
  const [departureTime, setDepartureTime] = useState(schedule?.departureTime ?? '08:00');
  const [days, setDays] = useState<string[]>(schedule?.daysOfWeek ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSave = async () => {
    if (!routeId || !shuttleId || !driverId || days.length === 0) return;
    setSaving(true);
    try {
      await onSave(schedule?.id ?? null, {
        routeId,
        shuttleId,
        driverId,
        departureTime,
        daysOfWeek: days,
        isActive: true,
      });
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Route" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
          <option value="">Select a route</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        <Select label="Shuttle" value={shuttleId} onChange={(e) => setShuttleId(e.target.value)}>
          <option value="">Select a shuttle</option>
          {shuttles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.plateNumber}
            </option>
          ))}
        </Select>
        <Select label="Driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
          <option value="">Select a driver</option>
          {approvedDrivers.map((d) => (
            <option key={d.uid} value={d.uid}>
              {d.fullName}
            </option>
          ))}
        </Select>
        <Input
          label="Departure time"
          type="time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-sm text-textSecondary">Days</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                days.includes(day) ? 'bg-primary text-white' : 'border border-border text-textSecondary'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} loading={saving}>
          Save schedule
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default function SchedulesPage() {
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } = useSchedules();
  const { routes } = useRoutes();
  const { shuttles } = useShuttles();
  const { drivers } = useDrivers();
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);

  const editingSchedule =
    editingId && editingId !== 'new' ? schedules.find((s) => s.id === editingId) ?? null : null;

  const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? '—';
  const shuttlePlate = (id: string) => shuttles.find((s) => s.id === id)?.plateNumber ?? '—';
  const driverName = (id: string) => drivers.find((d) => d.uid === id)?.fullName ?? '—';

  const handleSave = async (id: string | null, input: ScheduleFormInput) => {
    if (id) await updateSchedule(id, input);
    else await createSchedule(input);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-textPrimary">Schedules</h1>
          <p className="mt-1 text-sm text-textSecondary">
            Departure times linking a route, shuttle, and driver.
          </p>
        </div>
        <Button onClick={() => setEditingId('new')}>Add schedule</Button>
      </div>

      {editingId === 'new' && (
        <ScheduleEditor schedule={null} onSave={handleSave} onCancel={() => setEditingId(null)} />
      )}
      {editingSchedule && (
        <ScheduleEditor
          schedule={editingSchedule}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      )}

      {loading && <p className="text-sm text-textSecondary">Loading…</p>}
      {!loading && schedules.length === 0 && editingId === null && (
        <Card>
          <p className="text-sm text-textSecondary">No schedules yet. Add the first one above.</p>
        </Card>
      )}

      <Card>
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-textPrimary">
                {schedule.departureTime} · {routeName(schedule.routeId)}
              </p>
              <p className="text-xs text-textSecondary">
                {shuttlePlate(schedule.shuttleId)} · {driverName(schedule.driverId)} ·{' '}
                {schedule.daysOfWeek.join(', ')}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingId(schedule.id)}
                className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-primary"
                aria-label="Edit schedule"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteSchedule(schedule.id)}
                className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-danger"
                aria-label="Delete schedule"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
