'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { useDrivers } from '../../../hooks/useDrivers';
import { useShuttles } from '../../../hooks/useShuttles';
import type { DriverRecord } from '../../../lib/types/driver';

function StatusBadge({ status }: { status: DriverRecord['approvalStatus'] }) {
  if (status === 'approved') return <Badge tone="success">Approved</Badge>;
  if (status === 'rejected') return <Badge tone="danger">Rejected</Badge>;
  return <Badge tone="warning">Pending review</Badge>;
}

function ApprovalRow({
  driver,
  shuttleOptions,
  onApprove,
  onReject,
}: {
  driver: DriverRecord;
  shuttleOptions: { id: string; label: string }[];
  onApprove: (uid: string, shuttleId: string) => Promise<void>;
  onReject: (uid: string) => Promise<void>;
}) {
  const [shuttleId, setShuttleId] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    if (!shuttleId) return;
    setBusy('approve');
    try {
      await onApprove(driver.uid, shuttleId);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    setBusy('reject');
    try {
      await onReject(driver.uid);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-textPrimary">{driver.fullName || 'Unnamed driver'}</p>
        <p className="text-xs text-textSecondary">{driver.phone}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={shuttleId}
          onChange={(e) => setShuttleId(e.target.value)}
          className="w-56"
          aria-label="Assign shuttle"
        >
          <option value="">Assign a shuttle…</option>
          {shuttleOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button variant="primary" onClick={handleApprove} loading={busy === 'approve'} disabled={!shuttleId}>
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="danger" onClick={handleReject} loading={busy === 'reject'}>
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

export default function DriversPage() {
  const { drivers, loading, approveDriver, rejectDriver } = useDrivers();
  const { shuttles } = useShuttles();

  const pending = drivers.filter((d) => d.approvalStatus === 'pending');
  const others = drivers.filter((d) => d.approvalStatus !== 'pending');
  const shuttleOptions = shuttles.map((s) => ({ id: s.id, label: `${s.plateNumber} (${s.capacity} seats)` }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-medium text-textPrimary">Drivers</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Review new driver sign-ups and manage existing drivers.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-textPrimary">
            Pending approval {pending.length > 0 && `(${pending.length})`}
          </h2>
        </div>

        {loading && <p className="text-sm text-textSecondary">Loading…</p>}

        {!loading && shuttles.length === 0 && pending.length > 0 && (
          <p className="mb-4 text-sm text-textSecondary">
            No shuttles exist yet, so there's nothing to assign. Add one on the{' '}
            <Link href="/shuttles" className="font-medium text-primary">
              Shuttles
            </Link>{' '}
            page first.
          </p>
        )}

        {!loading && pending.length === 0 && (
          <p className="text-sm text-textSecondary">No drivers waiting for review right now.</p>
        )}

        {pending.map((driver) => (
          <ApprovalRow
            key={driver.uid}
            driver={driver}
            shuttleOptions={shuttleOptions}
            onApprove={approveDriver}
            onReject={rejectDriver}
          />
        ))}
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-textPrimary">All drivers</h2>

        {!loading && others.length === 0 && (
          <p className="text-sm text-textSecondary">No approved or rejected drivers yet.</p>
        )}

        <div className="flex flex-col">
          {others.map((driver) => (
            <div
              key={driver.uid}
              className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-textPrimary">{driver.fullName}</p>
                <p className="text-xs text-textSecondary">
                  {driver.phone}
                  {driver.assignedShuttleId
                    ? ` · Shuttle: ${
                        shuttles.find((s) => s.id === driver.assignedShuttleId)?.plateNumber ??
                        driver.assignedShuttleId
                      }`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={driver.approvalStatus} />
                <Badge tone={driver.status === 'online' ? 'success' : 'neutral'}>
                  {driver.status === 'online' ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
