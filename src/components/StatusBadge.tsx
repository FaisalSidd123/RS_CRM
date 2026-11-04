import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatusType =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Visit Scheduled'
  | 'Visit Done'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Available'
  | 'Under Offer'
  | 'Sold'
  | 'Rented'
  | 'Off Market'
  | 'Token Received'
  | 'Agreement Signed'
  | 'Transfer in Process'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Pending'
  | 'Overdue'
  | 'Hot'
  | 'Warm'
  | 'Cold'
  | 'Active'
  | 'Inactive'
  | 'Received'
  | 'Partially Received'
  | 'Paid'
  | 'Approved'
  | 'Pending approval'
  | string;

export interface StatusBadgeProps {
  status: BadgeStatusType;
  className?: string;
  dot?: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  // Green / Won / Available / Active / Received
  Won: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Closed Won': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Received: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Hot: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },

  // Blue / Info / Qualified / Transfer / Scheduled
  Qualified: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Visit Scheduled': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Visit Done': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Transfer in Process': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Warm: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },

  // Amber / Warning / Negotiation / Token / Under Offer / Pending
  Negotiation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Token Received': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Agreement Signed': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Under Offer': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Partially Received': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Pending approval': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Contacted: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },

  // Purple / Violet / New / Rented
  New: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Rented: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },

  // Gray / Neutral / Cold / Off Market / Sold
  Sold: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Off Market': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Cold: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },

  // Red / Lost / Cancelled / Overdue / No Show
  Lost: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Closed Lost': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'No Show': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  dot = false,
}) => {
  const style = statusStyles[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            style.text.replace('text-', 'bg-')
          )}
        />
      )}
      {status}
    </span>
  );
};

