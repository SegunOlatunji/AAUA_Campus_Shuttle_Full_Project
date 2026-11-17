'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Sidebar } from '../../components/layout/Sidebar';

function Guard({ children }: { children: ReactNode }) {
  const { firebaseUser, initializing } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !firebaseUser) {
      router.replace('/login');
    }
  }, [initializing, firebaseUser, router]);

  if (initializing || !firebaseUser) {
    return <div className="flex min-h-screen items-center justify-center bg-surface" />;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Guard>{children}</Guard>;
}
