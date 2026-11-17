import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  const tones: Record<string, string> = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/20 text-[#8A6A1F]',
    danger: 'bg-danger/10 text-danger',
    neutral: 'bg-border/60 text-textSecondary',
  };

  return (
    <span
      className={clsx('rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}
