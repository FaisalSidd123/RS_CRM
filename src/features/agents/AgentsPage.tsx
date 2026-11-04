import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { User } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { AgentAvatar } from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { formatDate, formatPKR } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  ShieldAlert,
  UserX,
  Target,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AgentsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { users, leads, deals, visits, tasks, deactivateAgentAndReassign } = useAppStore();

  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [agentToDeactivate, setAgentToDeactivate] = useState<User | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('usr-3'); // Ayesha Khan default

  const agentUsers = users.filter((u) => u.role === 'Agent');

  // Calculate agent stats
  const agentStats = useMemo(() => {
    return agentUsers.map((agent) => {
      const aLeads = leads.filter((l) => l.assignedAgentId === agent.id);
      const aVisits = visits.filter((v) => v.agentId === agent.id);
      const aDeals = deals.filter((d) => d.sellingAgentId === agent.id && d.stage === 'Closed Won');
      const openDeals = deals.filter(
        (d) => (d.sellingAgentId === agent.id || d.listingAgentId === agent.id) &&
        d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'
      );
      const overdueTasks = tasks.filter((t) => t.agentId === agent.id && t.status === 'Pending' && new Date(t.dueDateTime) < new Date());

      const salesValue = aDeals.reduce((sum, d) => sum + d.dealValue, 0);
      const commissionEarned = aDeals.reduce((sum, d) => sum + d.commissionSplit.agentShareAmount, 0);

      const achievedPercent = agent.targetMonthlySales > 0
        ? Math.min(100, Math.round((salesValue / agent.targetMonthlySales) * 100))
        : 0;

      return {
        agent,
        leadsCount: aLeads.length,
        openDealsCount: openDeals.length,
        visitsCount: aVisits.length,
        dealsClosed: aDeals.length,
        salesValue,
        commissionEarned,
        achievedPercent,
        overdueCount: overdueTasks.length,
      };
    });
  }, [agentUsers, leads, deals, visits, tasks]);

  // Selected agent deep details
  const selectedDetails = useMemo(() => {
    if (!selectedAgent) return null;
    const aLeads = leads.filter((l) => l.assignedAgentId === selectedAgent.id);
    const aVisits = visits.filter((v) => v.agentId === selectedAgent.id);
    const aDeals = deals.filter((d) => d.sellingAgentId === selectedAgent.id && d.stage === 'Closed Won');
    const openDeals = deals.filter(
      (d) => (d.sellingAgentId === selectedAgent.id || d.listingAgentId === selectedAgent.id) &&
      d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'
    );
    const overdueTasks = tasks.filter((t) => t.agentId === selectedAgent.id && t.status === 'Pending' && new Date(t.dueDateTime) < new Date());
    const salesValue = aDeals.reduce((sum, d) => sum + d.dealValue, 0);
    const commissionEarned = aDeals.reduce((sum, d) => sum + d.commissionSplit.agentShareAmount, 0);

    // Mock 6 month trend
    const chartData = [
      { month: 'Jun', sales: Math.round(salesValue * 0.12) },
      { month: 'Jul', sales: Math.round(salesValue * 0.18) },
      { month: 'Aug', sales: Math.round(salesValue * 0.22) },
      { month: 'Sep', sales: Math.round(salesValue * 0.2) },
      { month: 'Oct', sales: Math.round(salesValue * 0.28) },
      { month: 'Nov', sales: Math.round(salesValue * 0.35) },
    ];

    return {
      aLeads,
      aVisits,
      aDeals,
      openDeals,
      overdueTasks,
      salesValue,
      commissionEarned,
      chartData,
    };
  }, [selectedAgent, leads, visits, deals, tasks]);

  const handleConfirmDeactivate = () => {
    if (!agentToDeactivate || !reassignTargetId) return;
    deactivateAgentAndReassign(
      agentToDeactivate.id,
      reassignTargetId,
      currentUser?.name || 'Owner'
    );
    toast.success(
      `Agent ${agentToDeactivate.name} deactivated. All leads and pipeline deals transferred safely.`
    );
    setDeactivateModalOpen(false);
    setAgentToDeactivate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Agent Directory & Performance"
        description="Monitor sales targets, response times, and manage agency portfolio security when agents depart."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-700" />
              Agency Data Custody Protected
            </div>
          </div>
        }
      />

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentStats.map(({ agent, leadsCount, openDealsCount, dealsClosed, salesValue, commissionEarned, achievedPercent, overdueCount }) => (
          <Card
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={`cursor-pointer hover:shadow-md transition-all p-4 space-y-3 border flex flex-col justify-between ${
              !agent.active ? 'bg-slate-50/80 border-slate-200 opacity-80' : 'bg-white hover:border-emerald-300'
            }`}
          >
            <div className="space-y-2.5">
              {/* Agent Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <AgentAvatar name={agent.name} avatarText={agent.avatar} size="md" />
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-900 leading-tight">
                      {agent.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{agent.phone}</span>
                  </div>
                </div>
                <StatusBadge status={agent.active ? 'Active' : 'Inactive'} />
              </div>

              {/* Target Achievement Progress */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Sales Target:</span>
                  <span className="font-semibold text-slate-800">{achievedPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      achievedPercent >= 80 ? 'bg-emerald-600' : achievedPercent >= 40 ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${achievedPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Sales Volume</span>
                  <span className="font-semibold text-slate-900">{formatPKR(salesValue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Deals Won</span>
                  <span className="font-semibold text-emerald-700">{dealsClosed} Closed</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Leads Assigned</span>
                  <span className="font-semibold text-slate-800">{leadsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Avg Response</span>
                  <span className="font-semibold text-slate-800">{agent.responseTimeHours || 2}h</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              {overdueCount > 0 ? (
                <span className="text-red-600 font-bold text-[11px] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {overdueCount} Overdue
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">No overdue tasks</span>
              )}

              {agent.active && can(currentUser?.role, 'manage_agents') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgentToDeactivate(agent);
                    setDeactivateModalOpen(true);
                  }}
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Deactivate
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* ============================================================== */}
      {/* AGENT DETAIL SHEET */}
      {/* ============================================================== */}
      <Sheet open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        {selectedAgent && selectedDetails && (
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between pr-6">
                <div className="flex items-center gap-3">
                  <AgentAvatar name={selectedAgent.name} avatarText={selectedAgent.avatar} size="lg" />
                  <div>
                    <SheetTitle className="text-xl">{selectedAgent.name}</SheetTitle>
                    <SheetDescription>
                      Joined {formatDate(selectedAgent.joinedDate)} • {selectedAgent.email}
                    </SheetDescription>
                  </div>
                </div>
                <StatusBadge status={selectedAgent.active ? 'Active' : 'Inactive'} />
              </div>
            </SheetHeader>

            {/* Monthly KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Sales</span>
                <p className="font-bold text-slate-900 text-sm">{formatPKR(selectedDetails.salesValue)}</p>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Commission Earned</span>
                <p className="font-bold text-emerald-700 text-sm">{formatPKR(selectedDetails.commissionEarned)}</p>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Closed Deals</span>
                <p className="font-bold text-slate-900 text-sm">{selectedDetails.aDeals.length}</p>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Response Speed</span>
                <p className="font-bold text-slate-900 text-sm">{selectedAgent.responseTimeHours}h avg</p>
              </div>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">6-Month Production Trend (PKR)</CardTitle>
                <CardDescription>Sales closed value</CardDescription>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedDetails.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 10000000).toFixed(1)}Cr`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatPKR(Number(val)), 'Sales Value']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="sales" fill="#0F766E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Current Active Leads Assigned */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Assigned Leads ({selectedDetails.aLeads.length})
              </h4>
              <div className="space-y-1.5 text-xs max-h-52 overflow-y-auto pr-1">
                {selectedDetails.aLeads.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      <div className="text-[11px] text-slate-500">{l.preferredLocations[0]} • {l.propertyType}</div>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* ============================================================== */}
      {/* DEACTIVATE AGENT & REASSIGN PORTFOLIO MODAL (CORE SELLING POINT) */}
      {/* ============================================================== */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Deactivate Agent & Secure Client Data
            </DialogTitle>
            <DialogDescription>
              Client data stays with your agency when an agent departs. All leads, clients, and open deals are transferred
              instantly.
            </DialogDescription>
          </DialogHeader>

          {agentToDeactivate && (
            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1 text-red-950">
                <p className="font-semibold">
                  You are deactivating {agentToDeactivate.name}.
                </p>
                <p className="text-[11px] text-red-800">
                  This agent has{' '}
                  <strong>
                    {leads.filter((l) => l.assignedAgentId === agentToDeactivate.id).length} leads
                  </strong>{' '}
                  and{' '}
                  <strong>
                    {
                      deals.filter(
                        (d) =>
                          (d.sellingAgentId === agentToDeactivate.id || d.listingAgentId === agentToDeactivate.id) &&
                          d.stage !== 'Closed Won' &&
                          d.stage !== 'Closed Lost'
                      ).length
                    }{' '}
                    open deals
                  </strong>{' '}
                  in progress.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-800">
                  Reassign Entire Portfolio To:
                </label>
                <select
                  value={reassignTargetId}
                  onChange={(e) => setReassignTargetId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold"
                >
                  {users
                    .filter((u) => u.role === 'Agent' && u.active && u.id !== agentToDeactivate.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Active Advisor)
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeactivate}
              className="gap-1.5"
            >
              Transfer & Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

