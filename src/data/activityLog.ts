import { ActivityLogEntry } from '@/types';
import { relativeDaysAgo } from './seedGenerator';

export function generateInitialActivityLog(): ActivityLogEntry[] {
  const entries: ActivityLogEntry[] = [
    {
      id: 'act-1',
      timestamp: relativeDaysAgo(0, -1),
      userId: 'usr-5',
      userName: 'Usman Tariq',
      userRole: 'Agent',
      action: 'Bulk Contact Lookup',
      record: 'Viewed 42 owner phone numbers in 15 minutes',
      ipAddress: '110.38.12.89 (PTCL Karachi)',
      isSuspicious: true,
      suspiciousReason: 'Unusually high velocity: Agent viewed 40+ owner contacts today. Possible data scraping.',
    },
    {
      id: 'act-2',
      timestamp: relativeDaysAgo(0, -3),
      userId: 'usr-1',
      userName: 'Imran Qureshi',
      userRole: 'Owner',
      action: 'Locked Commission Split',
      record: 'Locked split 1% + 1% (40% agent) on Deal D-1011',
      ipAddress: '39.40.112.54 (DHA Phase 6 Office)',
    },
    {
      id: 'act-3',
      timestamp: relativeDaysAgo(0, -5),
      userId: 'usr-3',
      userName: 'Ayesha Khan',
      userRole: 'Agent',
      action: 'Scheduled Site Visit',
      record: 'Visit scheduled with Tariq Mansoor for PK-DHA-0142',
      ipAddress: '182.180.20.10 (Nayatel Lahore)',
    },
    {
      id: 'act-4',
      timestamp: relativeDaysAgo(1, -2),
      userId: 'usr-2',
      userName: 'Sana Malik',
      userRole: 'Manager',
      action: 'Lead Reassignment',
      record: 'Reassigned 8 overdue leads from Usman Tariq to Ayesha Khan',
      ipAddress: '39.40.112.54 (DHA Phase 6 Office)',
    },
    {
      id: 'act-5',
      timestamp: relativeDaysAgo(1, -6),
      userId: 'usr-5',
      userName: 'Usman Tariq',
      userRole: 'Agent',
      action: 'Export Attempt',
      record: 'Blocked attempt to download client contact book',
      ipAddress: '110.38.12.89 (PTCL Karachi)',
      isSuspicious: true,
      suspiciousReason: 'Agent role attempted unauthorized client database export.',
    },
    {
      id: 'act-6',
      timestamp: relativeDaysAgo(2, -4),
      userId: 'usr-1',
      userName: 'Imran Qureshi',
      userRole: 'Owner',
      action: 'Export Leads',
      record: 'Full agency leads CSV export (120 records)',
      ipAddress: '39.40.112.54 (DHA Phase 6 Office)',
    },
    {
      id: 'act-7',
      timestamp: relativeDaysAgo(2, -8),
      userId: 'usr-4',
      userName: 'Bilal Ahmed',
      userRole: 'Agent',
      action: 'Created Deal',
      record: 'Created Bayana token deal D-1015 (PK-LHR-DHA-0502)',
      ipAddress: '119.160.11.45 (StormFiber Karachi)',
    },
  ];

  const actions = [
    { action: 'Viewed Owner Phone', record: 'Revealed owner contact for PK-DHA-0143' },
    { action: 'Logged Call Outcome', record: 'Follow-up call logged with positive negotiation response' },
    { action: 'Updated Lead Status', record: 'Moved lead to Qualified stage' },
    { action: 'Added Property Listing', record: 'Listed new 500 Sq Yd Bungalow in Phase 6' },
    { action: 'Completed Site Visit', record: 'Marked site visit completed and recorded buyer feedback' },
  ];

  const users = [
    { id: 'usr-3', name: 'Ayesha Khan', role: 'Agent' as const },
    { id: 'usr-4', name: 'Bilal Ahmed', role: 'Agent' as const },
    { id: 'usr-6', name: 'Hira Siddiqui', role: 'Agent' as const },
    { id: 'usr-7', name: 'Zain Abbas', role: 'Agent' as const },
    { id: 'usr-2', name: 'Sana Malik', role: 'Manager' as const },
  ];

  for (let i = 8; i <= 50; i++) {
    const act = actions[i % actions.length];
    const usr = users[i % users.length];
    const daysAgo = Math.floor(i / 3);

    entries.push({
      id: `act-${i}`,
      timestamp: relativeDaysAgo(daysAgo, -(i % 12)),
      userId: usr.id,
      userName: usr.name,
      userRole: usr.role,
      action: act.action,
      record: act.record,
      ipAddress: `119.160.${(i * 7) % 250}.${(i * 13) % 250} (Karachi)`,
    });
  }

  return entries;
}

export const INITIAL_ACTIVITY_LOG = generateInitialActivityLog();

