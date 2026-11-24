import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/StatCard';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { AgentAvatar } from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPKR, formatDate, formatTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  Users,
  Target,
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  FileText,
  UserCheck,
  Flame,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const SOURCE_COLORS: Record<string, string> = {
  Zameen: '#0F766E', // Emerald
  Facebook: '#2563EB', // Blue
  WhatsApp: '#16A34A', // Green
  Instagram: '#D946EF', // Fuchsia
  Phone: '#EA580C', // Orange
  'Walk-in': '#6366F1', // Indigo
  Referral: '#8B5CF6', // Purple
};

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { leads, properties, clients, deals, visits, tasks, commissions, expenses, users, agencyProfile } = useAppStore();
  const [dateRange, setDateRange] = useState<'This month' | 'Last month' | 'Last 90 days' | 'This year'>('This month');
  const navigate = useNavigate();

  const isOwnerOrManager = currentUser?.role === 'Owner' || currentUser?.role === 'Manager';
  const isAgent = currentUser?.role === 'Agent';

  // Greeting time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.name.split(' ')[0] || 'User';

  // === CALCULATIONS FOR OWNER / MANAGER ===
  // KPIs
  const newInquiriesCount = leads.length;
  const activeClientsCount = clients.filter((c) => c.types.includes('Buyer') || c.types.includes('Investor')).length;
  const visitsScheduledCount = visits.filter((v) => v.status === 'Scheduled').length;
  const dealsClosedCount = deals.filter((d) => d.stage === 'Closed Won').length;

  // Financials
  const totalCommissionEarned = useMemo(() => {
    return commissions.reduce((sum, c) => sum + c.totalAgencyCommission, 0);
  }, [commissions]);

  const pendingReceivables = useMemo(() => {
    return commissions.reduce((sum, c) => sum + c.balance, 0);
  }, [commissions]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netAgencyProfit = totalCommissionEarned - totalExpenses;

  // Revenue vs Expenses 6 Month Chart Data
  const financialChartData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((m, idx) => {
      // Proportional monthly distribution
      const rev = [2800000, 3600000, 4200000, 3900000, 5100000, 6200000][idx];
      const exp = [1600000, 1650000, 1720000, 1680000, 1750000, 1800000][idx];
      return {
        month: m,
        Revenue: rev,
        Expenses: exp,
        Profit: rev - exp,
      };
    });
  }, []);

  // Leads by Source Donut
  const leadSourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Agent Leaderboard
  const agentLeaderboard = useMemo(() => {
    return users
      .filter((u) => u.role === 'Agent' && u.active)
      .map((agent) => {
        const agentLeads = leads.filter((l) => l.assignedAgentId === agent.id);
        const agentVisits = visits.filter((v) => v.agentId === agent.id);
        const agentDeals = deals.filter((d) => d.sellingAgentId === agent.id && d.stage === 'Closed Won');
        const overdueTasks = tasks.filter((t) => t.agentId === agent.id && t.status === 'Pending' && new Date(t.dueDateTime) < new Date());

        const salesValue = agentDeals.reduce((sum, d) => sum + d.dealValue, 0);
        const commissionEarned = agentDeals.reduce((sum, d) => sum + d.commissionSplit.agentShareAmount, 0);
        const convPercent = agentLeads.length > 0 ? Math.round((agentDeals.length / agentLeads.length) * 100) : 0;

        return {
          agent,
          leadsAssigned: agentLeads.length,
          visitsDone: agentVisits.length,
          dealsClosed: agentDeals.length,
          salesValue,
          commissionEarned,
          convPercent,
          overdueCount: overdueTasks.length,
        };
      })
      .sort((a, b) => b.salesValue - a.salesValue);
  }, [users, leads, visits, deals, tasks]);

  // "Needs your attention"
  const unassignedLeads = useMemo(() => {
    return leads.filter((l) => !l.assignedAgentId);
  }, [leads]);

  const stuckDeals = useMemo(() => {
    return deals.filter((d) => d.stage === 'Token Received' && d.daysInStage > 14);
  }, [deals]);

  const duplicateLeads = useMemo(() => {
    return leads.filter((l) => l.isDuplicate);
  }, [leads]);

  const overdueFollowUpsCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Pending' && new Date(t.dueDateTime) < new Date()).length;
  }, [tasks]);

  // Inventory Summary
  const inventorySummary = useMemo(() => {
    const available = properties.filter((p) => p.status === 'Available').length;
    const underOffer = properties.filter((p) => p.status === 'Under Offer').length;
    const sold = properties.filter((p) => p.status === 'Sold').length;
    const rented = properties.filter((p) => p.status === 'Rented').length;
    return { available, underOffer, sold, rented, total: properties.length };
  }, [properties]);

  // Upcoming visits today and tomorrow
  const upcomingVisits = useMemo(() => {
    return visits.filter((v) => v.status === 'Scheduled').slice(0, 4);
  }, [visits]);

  // === AGENT PERSONAL VIEW CALCULATIONS ===
  const myLeads = leads.filter((l) => l.assignedAgentId === currentUser?.id);
  const myTasksToday = tasks.filter((t) => t.agentId === currentUser?.id && t.status === 'Pending');
  const myVisits = visits.filter((v) => v.agentId === currentUser?.id);
  const myDeals = deals.filter((d) => d.sellingAgentId === currentUser?.id);
  const myCommission = commissions
    .filter((c) => c.agentId === currentUser?.id)
    .reduce((sum, c) => sum + c.agentShare, 0);

  return (
    <div className="space-y-6">
      {/* Header with Persona & Date Range Filter */}
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={
          isOwnerOrManager
            ? `Here is your agency executive overview for ${agencyProfile.name}.`
            : `Here is your daily activity and deal pipeline progress.`
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-[8px] bg-white p-1 border border-slate-200 shadow-2xs text-xs font-medium">
              {(['This month', 'Last month', 'Last 90 days', 'This year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-2.5 py-1 rounded-[6px] transition-colors ${
                    dateRange === range
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* ============================================================== */}
      {/* IF OWNER OR MANAGER: FULL AGENCY METRICS */}
      {/* ============================================================== */}
      {isOwnerOrManager && (
        <>
          {/* Row 1: 4 Activity KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="New Inquiries"
              value={newInquiriesCount}
              trend={{ value: '18%', isPositive: true, label: 'vs last month' }}
              icon={<Users className="h-4 w-4" />}
              onClick={() => navigate('/app/leads')}
            />
            <StatCard
              title="Active Clients (Buyers)"
              value={activeClientsCount}
              trend={{ value: '12%', isPositive: true, label: 'vs last month' }}
              icon={<UserCheck className="h-4 w-4" />}
              onClick={() => navigate('/app/clients')}
            />
            <StatCard
              title="Site Visits Scheduled"
              value={visitsScheduledCount}
              trend={{ value: '4 visits', isNeutral: true, label: 'today & tomorrow' }}
              icon={<Calendar className="h-4 w-4" />}
              onClick={() => navigate('/app/visits')}
            />
            <StatCard
              title="Deals Closed Won"
              value={dealsClosedCount}
              trend={{ value: '25%', isPositive: true, label: 'conversion rate' }}
              icon={<Briefcase className="h-4 w-4" />}
              onClick={() => navigate('/app/deals')}
            />
          </div>

          {/* Row 2: 4 Agency Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Agency Commission Earned"
              value={formatPKR(totalCommissionEarned)}
              trend={{ value: '22%', isPositive: true, label: 'vs target' }}
              icon={<DollarSign className="h-4 w-4" />}
              onClick={() => navigate('/app/commissions')}
            />
            <StatCard
              title="Pending Receivables"
              value={formatPKR(pendingReceivables)}
              subtitle="Token & Transfer balances"
              icon={<Clock className="h-4 w-4" />}
              onClick={() => navigate('/app/commissions')}
            />
            <StatCard
              title="Operating Expenses (6 Mo)"
              value={formatPKR(totalExpenses)}
              subtitle="Rent, Salaries, Zameen pkg"
              icon={<TrendingUp className="h-4 w-4 text-slate-500" />}
              onClick={() => navigate('/app/commissions')}
            />
            <StatCard
              title="Agency Net Profit"
              value={formatPKR(netAgencyProfit)}
              trend={{ value: 'Healthy margin', isPositive: true, label: 'after payouts & overhead' }}
              icon={<Target className="h-4 w-4 text-emerald-600" />}
              onClick={() => navigate('/app/commissions')}
            />
          </div>

          {/* Row 3: Revenue vs Expenses (2/3) & Leads by Source (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue vs Expenses */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Agency Commission Revenue vs Operational Expenses (PKR)</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/commissions')} className="text-xs text-emerald-700">
                  Ledger Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatPKR(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#E2E8F0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Revenue" fill="#0F766E" radius={[4, 4, 0, 0]} name="Commission Revenue" />
                    <Bar dataKey="Expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Leads by Source Donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inquiries by Lead Source</CardTitle>
                <CardDescription>Zameen, Meta Ads, WhatsApp & Referrals</CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex flex-col justify-between">
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {leadSourceData.map((entry) => (
                        <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Leads`, '']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-1">
                  {leadSourceData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: SOURCE_COLORS[item.name] || '#94A3B8' }}
                      />
                      <span className="text-slate-600 truncate">{item.name}:</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Agent Leaderboard & "Needs Your Attention" */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Leaderboard Table (2/3) */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Agent Performance Leaderboard</CardTitle>
                  <CardDescription>Sales production, visits, and follow-up discipline</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/agents')} className="text-xs text-emerald-700">
                  Full Team <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    <tr>
                      <th className="py-2 font-medium">Agent</th>
                      <th className="py-2 font-medium text-center">Leads</th>
                      <th className="py-2 font-medium text-center">Visits</th>
                      <th className="py-2 font-medium text-center">Deals</th>
                      <th className="py-2 font-medium text-right">Sales Volume</th>
                      <th className="py-2 font-medium text-right">Commission</th>
                      <th className="py-2 font-medium text-center">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agentLeaderboard.map((row, idx) => (
                      <tr key={row.agent.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <AgentAvatar name={row.agent.name} avatarText={row.agent.avatar} size="sm" />
                            <div>
                              <div className="font-medium text-slate-900 flex items-center gap-1.5">
                                <span>{row.agent.name}</span>
                                {idx === 0 && (
                                  <span className="inline-flex items-center px-1 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                    TOP
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{row.agent.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-slate-700">{row.leadsAssigned}</td>
                        <td className="py-2.5 text-center text-slate-700">{row.visitsDone}</td>
                        <td className="py-2.5 text-center font-semibold text-emerald-700">{row.dealsClosed}</td>
                        <td className="py-2.5 text-right font-medium text-slate-900">
                          <PriceText amount={row.salesValue} />
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">
                          {formatPKR(row.commissionEarned)}
                        </td>
                        <td className="py-2.5 text-center">
                          {row.overdueCount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              {row.overdueCount} overdue
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* "Needs Your Attention" Alert List (1/3) */}
            <Card className="border-amber-200 bg-amber-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Needs Your Attention
                </CardTitle>
                <CardDescription>Critical agency blockers requiring owner resolution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Unassigned Leads Alert */}
                {unassignedLeads.length > 0 && (
                  <div
                    onClick={() => navigate('/app/leads?filter=unassigned')}
                    className="p-3 rounded-lg border border-amber-300 bg-amber-50 shadow-2xs hover:border-amber-400 cursor-pointer space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-900">{unassignedLeads.length} Unassigned Leads</span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Assign Now
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Fresh inquiries from Zameen & Meta pending field advisor assignment.
                    </p>
                  </div>
                )}

                {/* Overdue Follow-ups */}
                <div
                  onClick={() => navigate('/app/tasks')}
                  className="p-3 rounded-lg border border-red-200 bg-white shadow-2xs hover:border-red-300 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-red-700">{overdueFollowUpsCount} Overdue Follow-ups</span>
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">Action</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Mostly assigned to Usman Tariq (9 overdue). Clients at risk of going cold.
                  </p>
                </div>

                {/* Stuck Deals */}
                <div
                  onClick={() => navigate('/app/deals')}
                  className="p-3 rounded-lg border border-amber-200 bg-white shadow-2xs hover:border-amber-300 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-800">{stuckDeals.length} Deals Stuck in Bayana</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">&gt; 14 Days</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    D-1013 and D-1014 awaiting society file verification. Seller follow-up overdue.
                  </p>
                </div>

                {/* Duplicate Leads */}
                <div
                  onClick={() => navigate('/app/leads')}
                  className="p-3 rounded-lg border border-blue-200 bg-white shadow-2xs hover:border-blue-300 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-800">{duplicateLeads.length} Duplicate Leads Flagged</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Review</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Matching phone numbers detected across Facebook Ads & Zameen inquiries.
                  </p>
                </div>

                {/* Inactive Agent Reassignment */}
                <div
                  onClick={() => navigate('/app/agents')}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-slate-300 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Kamran Shaikh Inactive</span>
                    <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">23 Leads</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    23 untouched leads ready to be reassigned to active producers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 5: Inventory Summary + Upcoming Visits + Lead Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inventory Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inventory Breakdown</CardTitle>
                <CardDescription>{inventorySummary.total} Total Agency Properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(inventorySummary.available / inventorySummary.total) * 100}%` }} className="bg-emerald-600" title="Available" />
                  <div style={{ width: `${(inventorySummary.underOffer / inventorySummary.total) * 100}%` }} className="bg-amber-500" title="Under Offer" />
                  <div style={{ width: `${(inventorySummary.sold / inventorySummary.total) * 100}%` }} className="bg-slate-400" title="Sold" />
                  <div style={{ width: `${(inventorySummary.rented / inventorySummary.total) * 100}%` }} className="bg-purple-500" title="Rented" />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      <span className="text-slate-600">Available</span>
                    </div>
                    <span className="font-semibold text-slate-900">{inventorySummary.available}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Under Offer</span>
                    </div>
                    <span className="font-semibold text-slate-900">{inventorySummary.underOffer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="text-slate-600">Sold</span>
                    </div>
                    <span className="font-semibold text-slate-900">{inventorySummary.sold}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-slate-600">Rented</span>
                    </div>
                    <span className="font-semibold text-slate-900">{inventorySummary.rented}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => navigate('/app/properties')} className="w-full text-xs mt-2">
                  View Full Property Grid
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Site Visits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Site Visits</CardTitle>
                <CardDescription>Scheduled tours today & tomorrow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {upcomingVisits.map((v) => {
                  const client = clients.find((c) => c.id === v.clientId);
                  const prop = properties.find((p) => p.id === v.propertyId);
                  const agent = users.find((u) => u.id === v.agentId);

                  return (
                    <div key={v.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{client?.name}</span>
                        <span className="text-emerald-700">{formatTime(v.time)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{prop?.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Agent: {agent?.name}</span>
                        {v.pickupRequired && <span className="text-amber-700 font-medium">Pickup Required</span>}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => navigate('/app/visits')} className="w-full text-xs mt-1">
                  View Visits Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Lead Funnel Pipeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Agency Lead Funnel</CardTitle>
                <CardDescription>Inquiry to Closed Won progression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {[
                  { stage: 'New Inquiries', count: leads.filter((l) => l.status === 'New').length, pct: 100, color: 'bg-purple-600' },
                  { stage: 'Contacted', count: leads.filter((l) => l.status === 'Contacted').length, pct: 75, color: 'bg-sky-600' },
                  { stage: 'Qualified', count: leads.filter((l) => l.status === 'Qualified').length, pct: 55, color: 'bg-blue-600' },
                  { stage: 'Site Visit Done', count: leads.filter((l) => l.status === 'Visit Done').length, pct: 40, color: 'bg-indigo-600' },
                  { stage: 'Negotiation', count: leads.filter((l) => l.status === 'Negotiation').length, pct: 28, color: 'bg-amber-600' },
                  { stage: 'Closed Won', count: dealsClosedCount, pct: 18, color: 'bg-emerald-600' },
                ].map((f) => (
                  <div key={f.stage} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{f.stage}</span>
                      <span className="font-semibold text-slate-900">{f.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* IF AGENT: PERSONAL PERFORMANCE VIEW */}
      {/* ============================================================== */}
      {isAgent && (
        <div className="space-y-6">
          {/* Agent Personal Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Assigned Leads"
              value={myLeads.length}
              subtitle="Active inquiries"
              icon={<Users className="h-4 w-4" />}
              onClick={() => navigate('/app/leads')}
            />
            <StatCard
              title="My Follow-ups Today"
              value={myTasksToday.length}
              subtitle="Pending customer actions"
              icon={<CheckSquare className="h-4 w-4 text-emerald-600" />}
              onClick={() => navigate('/app/tasks')}
            />
            <StatCard
              title="My Site Visits"
              value={myVisits.length}
              subtitle="Tours scheduled / completed"
              icon={<Calendar className="h-4 w-4" />}
              onClick={() => navigate('/app/visits')}
            />
            <StatCard
              title="My Commission This Month"
              value={formatPKR(myCommission)}
              trend={{ value: '40% agent cut', isPositive: true, label: 'on closed deals' }}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Active Deals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>My Deals in Pipeline</CardTitle>
                  <CardDescription>Track token & agreement signing</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')} className="text-xs text-emerald-700">
                  Open Deals <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {myDeals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active deals right now.</p>
                ) : (
                  myDeals.slice(0, 4).map((d) => (
                    <div key={d.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{d.dealCode}: {d.title}</div>
                        <div className="text-[11px] text-slate-500">Value: {formatPKR(d.dealValue)}</div>
                      </div>
                      <StatusBadge status={d.stage} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* My Overdue & Today's Follow-ups */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>My Follow-ups & Action Items</CardTitle>
                  <CardDescription>Stay on top of clients to prevent deal drop-offs</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/tasks')} className="text-xs text-emerald-700">
                  All Tasks <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {myTasksToday.slice(0, 4).map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500">Due: {formatDate(t.dueDateTime)} ({t.type})</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/app/tasks')} className="text-xs h-7">
                      Complete
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
