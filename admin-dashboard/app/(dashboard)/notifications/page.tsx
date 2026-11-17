'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { useNotifications } from '../../../hooks/useNotifications';
import { useRoutes } from '../../../hooks/useRoutes';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import type { NotificationTarget } from '../../../lib/types/notification';

export default function NotificationsPage() {
  const { notifications, loading, send } = useNotifications();
  const { routes } = useRoutes();
  const { profile } = useAdminAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'students' | 'drivers' | 'route'>('all');
  const [routeId, setRouteId] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !profile) return;
    if (targetType === 'route' && !routeId) return;

    const target: NotificationTarget = targetType === 'route' ? { routeId } : targetType;

    setSending(true);
    try {
      await send(title.trim(), message.trim(), target, profile.uid);
      setTitle('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const describeTarget = (target: NotificationTarget) => {
    if (typeof target === 'string') {
      return target === 'all' ? 'Everyone' : target === 'students' ? 'Students' : 'Drivers';
    }
    return `Route: ${routes.find((r) => r.id === target.routeId)?.name ?? target.routeId}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-textPrimary">Notifications</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Broadcast delays, route changes, or announcements to students and drivers.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Route A delayed" />
          <Textarea
            label="Message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Route A shuttle is running about 15 minutes behind schedule due to..."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Send to"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as typeof targetType)}
            >
              <option value="all">Everyone</option>
              <option value="students">Students only</option>
              <option value="drivers">Drivers only</option>
              <option value="route">A specific route's students</option>
            </Select>
            {targetType === 'route' && (
              <Select label="Route" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
                <option value="">Select a route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <Button onClick={handleSend} loading={sending} disabled={!title.trim() || !message.trim()}>
            <Send className="h-4 w-4" />
            Send notification
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-textPrimary">Sent history</h2>
        {loading && <p className="text-sm text-textSecondary">Loading…</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-sm text-textSecondary">Nothing sent yet.</p>
        )}
        {notifications.map((n) => (
          <div key={n.id} className="border-b border-border py-3 last:border-b-0">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-textPrimary">{n.title}</p>
              <Badge tone="neutral">{describeTarget(n.target)}</Badge>
            </div>
            <p className="text-xs text-textSecondary">{n.message}</p>
            <p className="mt-1 text-[11px] text-textSecondary/70">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
