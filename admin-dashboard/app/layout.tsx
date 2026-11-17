import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '../hooks/useAdminAuth';

export const metadata: Metadata = {
  title: 'AAUA Campus Shuttle — Admin',
  description: 'Transport coordination dashboard for Adekunle Ajasin University',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-textPrimary antialiased">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
