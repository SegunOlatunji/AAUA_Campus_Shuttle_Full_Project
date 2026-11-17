'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { useShuttles, type ShuttleFormInput } from '../../../hooks/useShuttles';
import { useRoutes } from '../../../hooks/useRoutes';
import { useDrivers } from '../../../hooks/useDrivers';
import type { ShuttleRecord } from '../../../lib/types/shuttle';

function ShuttleEditor({
  shuttle,
  onSave,
  onCancel,
}: {
  shuttle: ShuttleRecord | null;
  onSave: (id: string | null, input: ShuttleFormInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { routes } = useRoutes();
  const { drivers } = useDrivers();
  const approvedDrivers = drivers.filter((d) => d.approvalStatus === 'approved');

  const [plateNumber, setPlateNumber] = useState(shuttle?.plateNumber ?? '');
  const [capacity, setCapacity] = useState(shuttle?.capacity ?? 20);
  const [assignedRouteId, setAssignedRouteId] = useState(shuttle?.assignedRouteId ?? '');
  const [assignedDriverId, setAssignedDriverId] = useState(shuttle?.assignedDriverId ?? '');
  const [status, setStatus] = useState<ShuttleRecord['status']>(shuttle?.status ?? 'active');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!plateNumber.trim() || capacity <= 0) return;
    setSaving(true);
    try {
      await onSave(shuttle?.id ?? null, {
        plateNumber: plateNumber.trim(),
        capacity: Number(capacity),
        assignedRouteId: assignedRouteId || null,
        assignedDriverId: assignedDriverId || null,
        status,
      });
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Plate number"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          placeholder="AAA-123-XY"
        />
        <Input
          label="Capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
        <Select
          label="Assigned route"
          value={assignedRouteId}
          onChange={(e) => setAssignedRouteId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </Select>
        <Select
          label="Assigned driver"
          value={assignedDriverId}
          onChange={(e) => setAssignedDriverId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {approvedDrivers.map((driver) => (
            <option key={driver.uid} value={driver.uid}>
              {driver.fullName} · {driver.phone}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShuttleRecord['status'])}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </Select>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} loading={saving}>
          Save shuttle
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default function ShuttlesPage() {
  const { shuttles, loading, createShuttle, updateShuttle, deleteShuttle } = useShuttles();
  const { routes } = useRoutes();
  const { drivers } = useDrivers();
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);

  const editingShuttle =
    editingId && editingId !== 'new' ? shuttles.find((s) => s.id === editingId) ?? null : null;

  const routeName = (id: string | null) => routes.find((r) => r.id === id)?.name ?? '—';
  const driverName = (id: string | null) => drivers.find((d) => d.uid === id)?.fullName ?? '—';

  const handleSave = async (id: string | null, input: ShuttleFormInput) => {
    if (id) {
      await updateShuttle(id, input);
    } else {
      await createShuttle(input);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-textPrimary">Shuttles</h1>
          <p className="mt-1 text-sm text-textSecondary">
            The physical shuttle fleet, and which route/driver each is assigned to.
          </p>
        </div>
        <Button onClick={() => setEditingId('new')}>Add shuttle</Button>
      </div>

      {editingId === 'new' && (
        <ShuttleEditor shuttle={null} onSave={handleSave} onCancel={() => setEditingId(null)} />
      )}
      {editingShuttle && (
        <ShuttleEditor
          shuttle={editingShuttle}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      )}

      {loading && <p className="text-sm text-textSecondary">Loading…</p>}

      {!loading && shuttles.length === 0 && editingId === null && (
        <Card>
          <p className="text-sm text-textSecondary">No shuttles yet. Add the first one above.</p>
        </Card>
      )}

      <Card>
        {shuttles.map((shuttle) => (
          <div
            key={shuttle.id}
            className="flex items-center justify-between border-b border-border py-4 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-textPrimary">{shuttle.plateNumber}</p>
              <p className="text-xs text-textSecondary">
                {routeName(shuttle.assignedRouteId)} · {driverName(shuttle.assignedDriverId)} ·{' '}
                {shuttle.capacity} seats
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                tone={
                  shuttle.status === 'active'
                    ? 'success'
                    : shuttle.status === 'maintenance'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {shuttle.status}
              </Badge>
              <button
                onClick={() => setEditingId(shuttle.id)}
                className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-primary"
                aria-label={`Edit ${shuttle.plateNumber}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteShuttle(shuttle.id)}
                className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-danger"
                aria-label={`Delete ${shuttle.plateNumber}`}
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
