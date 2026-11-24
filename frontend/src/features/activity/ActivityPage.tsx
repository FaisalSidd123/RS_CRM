import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { ActivityLogEntry } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { AgentAvatar } from '@/components/AgentAvatar';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { formatDate, formatTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  ShieldAlert,
  AlertTriangle,
  FileDown,
  History,
  Lock,
  UserCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { activityLogs } = useAppStore();

  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Protect Owner view
  if (!can(currentUser?.role, 'view_activity_log')) {
    return (
      <div className="p-12 text-center space-y-3">
        <Lock className="h-10 w-10 text-slate-400 mx-auto" />
        <h2 className="font-heading text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The Agency Audit Trail is restricted to the agency Owner persona (Imran Qureshi).
        </p>
      </div>
    );
  }

  const suspiciousCount = activityLogs.filter((l) => l.isSuspicious).length;

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterUser !== 'all' && log.userId !== filterUser) return false;
      if (filterSuspiciousOnly && !log.isSuspicious) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesRecord = log.record.toLowerCase().includes(q);
        const matchesUser = log.userName.toLowerCase().includes(q);
        if (!matchesAction && !matchesRecord && !matchesUser) return false;
      }
      return true;
    });
  }, [activityLogs, filterUser, filterSuspiciousOnly, searchQuery]);

  const handleExportCSV = () => {
    toast.success('Agency activity audit trail exported to CSV for compliance review.');
  };

  const columns: Column<ActivityLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900">{formatDate(log.timestamp)}</span>
          <span className="text-slate-400 block text-[11px]">{formatTime(log.timestamp)}</span>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User & Role',
      render: (log) => (
        <div className="flex items-center gap-2 text-xs">
          <AgentAvatar name={log.userName} size="sm" />
          <div>
            <span className="font-semibold text-slate-900 block">{log.userName}</span>
            <span className="text-[10px] text-slate-400">{log.userRole}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Taken',
      render: (log) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-800">{log.action}</span>
          {log.isSuspicious && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Flagged Pattern
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'record',
      header: 'Details & Target Record',
      render: (log) => (
        <div className="space-y-0.5 text-xs">
          <span className="text-slate-700 block">{log.record}</span>
          {log.suspiciousReason && (
            <span className="text-[11px] text-amber-700 font-medium block">
              Warning: {log.suspiciousReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Origin IP / Network',
      render: (log) => (
        <span className="text-[11px] font-mono text-slate-400">{log.ipAddress}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Activity Audit & Security Log"
        description="Comprehensive audit trail of contact views, lead exports, status edits, and commission adjustments. Flagged patterns alert agency owners to unauthorized data leaks."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
              <FileDown className="h-3.5 w-3.5" />
              Export Audit CSV
            </Button>
          </div>
        }
      />

      {/* Flagged Alert Banner */}
      {suspiciousCount > 0 && (
        <div className="p-4 rounded-[10px] bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-amber-950">
            <div className="font-bold text-sm">
              {suspiciousCount} Suspicious Activity Patterns Detected
            </div>
            <p className="text-amber-800 leading-relaxed">
              Our automated heuristic detected Usman Tariq viewing 40+ owner contacts within 15 minutes, as well as an
              unauthorized database export attempt. Review highlighted entries below.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Filter:</span>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Team Members</option>
            <option value="usr-1">Imran Qureshi (Owner)</option>
            <option value="usr-2">Sana Malik (Manager)</option>
            <option value="usr-5">Usman Tariq (Agent)</option>
            <option value="usr-3">Ayesha Khan (Agent)</option>
            <option value="usr-4">Bilal Ahmed (Agent)</option>
          </select>

          <button
            onClick={() => setFilterSuspiciousOnly(!filterSuspiciousOnly)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
              filterSuspiciousOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Show Suspicious Only ({suspiciousCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search action, record, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Audit Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Search audit log..."
      />
    </div>
  );
};

