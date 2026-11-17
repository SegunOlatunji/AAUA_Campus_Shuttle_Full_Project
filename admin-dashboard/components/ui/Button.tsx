'use client';

import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primaryLight',
    secondary: 'border border-border bg-white text-textPrimary hover:bg-surface',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'text-textSecondary hover:bg-surface',
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
