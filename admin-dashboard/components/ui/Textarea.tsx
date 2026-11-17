'use client';

import clsx from 'clsx';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm text-textSecondary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(
          'w-full rounded-lg border border-border px-3.5 py-2.5 text-sm text-textPrimary outline-none focus:border-primary',
          className
        )}
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-textSecondary">{hint}</p>}
    </div>
  );
}
