'use client';

import clsx from 'clsx';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm text-textSecondary">
          {label}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          'w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-textPrimary outline-none focus:border-primary',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
