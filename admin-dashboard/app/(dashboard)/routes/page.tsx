'use client';

import { useState } from 'react';
import { Pencil, Trash2, Sparkles, MapPin } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { useRoutes } from '../../../hooks/useRoutes';
import type { RouteRecord, RouteStop } from '../../../lib/types/route';

function RouteEditor({
  route,
  onSave,
  onCancel,
}: {
  route: RouteRecord | null;
  onSave: (id: string | null, name: string, stopNames: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(route?.name ?? '');
  const [stopsText, setStopsText] = useState(
    route ? route.stops.map((s) => s.name).join('\n') : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(route?.id ?? null, name.trim(), stopsText.split('\n'));
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex flex-col gap-4">
        <Input label="Route name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea
          label="Stops, in order (one per line)"
          hint="This is the order shuttles pass through — it drives the live map and the shuttle-matching ETA. Note: re-saving names resets coordinates for any renamed/reordered stops, so pin coordinates after this is settled."
          rows={10}
          value={stopsText}
          onChange={(e) => setStopsText(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} loading={saving}>
            Save route
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StopCoordinatesEditor({
  route,
  onSave,
  onCancel,
}: {
  route: RouteRecord;
  onSave: (routeId: string, stops: RouteStop[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [stops, setStops] = useState<RouteStop[]>(route.stops.map((s) => ({ ...s })));
  const [saving, setSaving] = useState(false);

  const updateStop = (order: number, field: 'lat' | 'lng', raw: string) => {
    const value = raw.trim() === '' ? null : Number(raw);
    setStops((prev) =>
      prev.map((stop) => (stop.order === order ? { ...stop, [field]: value } : stop))
    );
  };

  const pinnedCount = stops.filter((s) => s.lat !== null && s.lng !== null).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(route.id, stops);
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-textPrimary">{route.name} — stop coordinates</p>
          <p className="mt-1 text-xs text-textSecondary">
            {pinnedCount}/{stops.length} pinned. Look up each stop on Google Maps (right-click a
            point → the coordinates are the first item in the context menu), then paste lat/lng
            here. A click-to-pin map editor is a good next enhancement once this data exists.
          </p>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {stops.map((stop) => (
          <div
            key={stop.order}
            className="grid grid-cols-[1fr,120px,120px] items-center gap-3 border-b border-border py-2 text-sm last:border-b-0"
          >
            <span className="text-textPrimary">
              {stop.order}. {stop.name}
            </span>
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={stop.lat ?? ''}
              onChange={(e) => updateStop(stop.order, 'lat', e.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-xs outline-none focus:border-primary"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={stop.lng ?? ''}
              onChange={(e) => updateStop(stop.order, 'lng', e.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} loading={saving}>
          Save coordinates
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default function RoutesPage() {
  const { routes, loading, seedAauaRoutes, saveRoute, deleteRoute, saveStopCoordinates } =
    useRoutes();
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const editingRoute = editingId && editingId !== 'new' ? routes.find((r) => r.id === editingId) ?? null : null;
  const pinningRoute = pinningId ? routes.find((r) => r.id === pinningId) ?? null : null;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedAauaRoutes();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-textPrimary">Routes</h1>
          <p className="mt-1 text-sm text-textSecondary">
            The four fixed shuttle routes and their stops, in order.
          </p>
        </div>
        <div className="flex gap-2">
          {routes.length === 0 && !loading && (
            <Button variant="secondary" onClick={handleSeed} loading={seeding}>
              <Sparkles className="h-4 w-4" />
              Load AAUA routes
            </Button>
          )}
          <Button onClick={() => setEditingId('new')}>Add route</Button>
        </div>
      </div>

      {editingId === 'new' && (
        <RouteEditor route={null} onSave={saveRoute} onCancel={() => setEditingId(null)} />
      )}
      {editingRoute && (
        <RouteEditor route={editingRoute} onSave={saveRoute} onCancel={() => setEditingId(null)} />
      )}
      {pinningRoute && (
        <StopCoordinatesEditor
          route={pinningRoute}
          onSave={saveStopCoordinates}
          onCancel={() => setPinningId(null)}
        />
      )}

      {loading && <p className="text-sm text-textSecondary">Loading…</p>}

      {!loading && routes.length === 0 && editingId === null && (
        <Card>
          <p className="text-sm text-textSecondary">
            No routes yet. Click <span className="font-medium text-textPrimary">Load AAUA routes</span> to
            populate the four real campus routes, or add one manually.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {routes.map((route) => {
          const pinnedCount = route.stops.filter((s) => s.lat !== null && s.lng !== null).length;
          return (
            <Card key={route.id}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">{route.name}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge tone="neutral">{route.stops.length} stops</Badge>
                    <Badge tone={pinnedCount === route.stops.length ? 'success' : 'warning'}>
                      {pinnedCount}/{route.stops.length} pinned
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPinningId(route.id)}
                    className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-primary"
                    aria-label={`Set coordinates for ${route.name}`}
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(route.id)}
                    className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-primary"
                    aria-label={`Edit ${route.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteRoute(route.id)}
                    className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-danger"
                    aria-label={`Delete ${route.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ol className="max-h-40 space-y-1 overflow-y-auto text-xs text-textSecondary">
                {route.stops.slice(0, 6).map((stop) => (
                  <li key={stop.order}>
                    {stop.order}. {stop.name}
                  </li>
                ))}
                {route.stops.length > 6 && (
                  <li className="text-textSecondary/70">+{route.stops.length - 6} more…</li>
                )}
              </ol>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
