import { NotificationItem } from '@/types';
import { relativeDaysAgo } from './seedGenerator';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Site Visit in 1 Hour',
    message: 'Ayesha Khan has a site visit scheduled at 4:30 PM for PK-DHA-0142 with Tariq Mansoor (Pickup requested).',
    timestamp: relativeDaysAgo(0, -1),
    type: 'warning',
    read: false,
    link: '/app/visits',
  },
  {
    id: 'notif-2',
    title: 'Overdue Follow-ups Alert',
    message: '9 follow-ups assigned to Usman Tariq are overdue by more than 3 days. Action required.',
    timestamp: relativeDaysAgo(0, -3),
    type: 'warning',
    read: false,
    link: '/app/tasks',
  },
  {
    id: 'notif-3',
    title: 'New High-Value Lead Assigned',
    message: 'Direct WhatsApp inquiry for 1000 Sq Yd DHA Phase 8 mansion assigned to Ayesha Khan.',
    timestamp: relativeDaysAgo(0, -5),
    type: 'info',
    read: false,
    link: '/app/leads',
  },
  {
    id: 'notif-4',
    title: 'Deal Token Received',
    message: 'PKR 1 Crore Bayana pay order deposited for PK-DHA-0142 (Deal D-1011). Commission split locked.',
    timestamp: relativeDaysAgo(1, -2),
    type: 'success',
    read: true,
    link: '/app/deals',
  },
  {
    id: 'notif-5',
    title: 'Duplicate Lead Blocked',
    message: 'Facebook Ads incoming lead (0300-8889901) matched an existing active client.',
    timestamp: relativeDaysAgo(1, -6),
    type: 'info',
    read: true,
    link: '/app/leads',
  },
];

