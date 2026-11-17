'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Bus,
  Route as RouteIcon,
  CalendarClock,
  Bell,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: GraduationCap },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/shuttles', label: 'Shuttles', icon: Bus },
  { href: '/routes', label: 'Routes', icon: RouteIcon },
  { href: '/schedules', label: 'Schedules', icon: CalendarClock },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAdminAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surfaceCard">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <span className="text-[10px] font-medium text-accent">AAUA</span>
        </div>
        <div>
          <p className="text-sm font-medium text-textPrimary">Campus Shuttle</p>
          <p className="text-xs text-textSecondary">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-textSecondary hover:bg-surface hover:text-textPrimary'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <p className="mb-2 truncate px-3 text-xs text-textSecondary">{profile?.email}</p>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-textSecondary hover:bg-surface hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
