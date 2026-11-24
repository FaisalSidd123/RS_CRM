import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { CommissionEntry, Expense, ExpenseCategory } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { StatCard } from '@/components/StatCard';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { formatDate, formatPKR } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Plus,
  CheckCircle2,
  PieChart as PieChartIcon,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const CommissionsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    commissions,
    expenses,
    updateCommissionPayment,
    recordAgentPayout,
    addExpense,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'commissions' | 'payments' | 'expenses' | 'summary'>('commissions');
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<CommissionEntry | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(500000);

  // Expense Modal State
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Office rent');
  const [expAmount, setExpAmount] = useState<number>(100000);
  const [expNote, setExpNote] = useState('');

  // Agents only see their personal commission rows if role is Agent
  const visibleCommissions = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return commissions.filter((c) => c.agentId === currentUser.id);
    }
    return commissions;
  }, [commissions, currentUser]);

  // Totals calculations
  const totalEarned = useMemo(() => visibleCommissions.reduce((sum, c) => sum + c.totalAgencyCommission, 0), [visibleCommissions]);
  const totalReceived = useMemo(() => visibleCommissions.reduce((sum, c) => sum + c.receivedAmount, 0), [visibleCommissions]);
  const totalPending = useMemo(() => visibleCommissions.reduce((sum, c) => sum + c.balance, 0), [visibleCommissions]);
  const totalAgentPayouts = useMemo(() => visibleCommissions.reduce((sum, c) => sum + c.agentPayoutAmount, 0), [visibleCommissions]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const netAgencyProfit = totalReceived - totalAgentPayouts - totalExpenses;

  // 6 Month summary chart
  const monthlySummaryData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((m, idx) => {
      const comm = [2800000, 3600000, 4200000, 3900000, 5100000, 6200000][idx];
      const payout = [1100000, 1400000, 1650000, 1500000, 2000000, 2400000][idx];
      const exp = [1600000, 1650000, 1720000, 1680000, 1750000, 1800000][idx];
      return {
        month: m,
        CommissionEarned: comm,
        AgentPayouts: payout,
        Expenses: exp,
        NetProfit: comm - payout - exp,
      };
    });
  }, []);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;
    updateCommissionPayment(selectedCommission.id, paymentAmount);
    toast.success(`Recorded PKR ${paymentAmount.toLocaleString()} payment against commission.`);
    setRecordPaymentModalOpen(false);
  };

  const handlePayoutAgent = (commId: string, agentName: string) => {
    recordAgentPayout(commId);
    toast.success(`Agent payout recorded for ${agentName}. Commission ledger settled.`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString(),
      note: expNote,
    });
    toast.success(`Expense of PKR ${expAmount.toLocaleString()} recorded.`);
    setAddExpenseModalOpen(false);
    setExpNote('');
  };

  const commissionColumns: Column<CommissionEntry>[] = [
    {
      key: 'propertyTitle',
      header: 'Deal & Property',
      render: (c) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-xs text-slate-900 block truncate max-w-[200px]">{c.propertyTitle}</span>
          <span className="text-[11px] text-slate-500 font-mono">Deal Value: {formatPKR(c.dealValue)}</span>
        </div>
      ),
    },
    {
      key: 'totalAgencyCommission',
      header: 'Agency Total',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-xs text-slate-900">{formatPKR(c.totalAgencyCommission)}</span>
      ),
    },
    {
      key: 'agentShare',
      header: 'Agent Cut',
      render: (c) => (
        <div className="text-xs">
          <span className="font-semibold text-emerald-700">{formatPKR(c.agentShare)}</span>
          <span className="text-[11px] text-slate-500 block">{c.agentName}</span>
        </div>
      ),
    },
    {
      key: 'agencyNet',
      header: 'Agency Retained',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-xs text-emerald-800">{formatPKR(c.agencyNet)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Receipt Status',
      sortable: true,
      render: (c) => <StatusBadge status={c.status} dot />,
    },
    {
      key: 'receivedAmount',
      header: 'Received / Balance',
      render: (c) => (
        <div className="text-xs space-y-0.5">
          <span className="font-medium text-slate-900 block">{formatPKR(c.receivedAmount)}</span>
          {c.balance > 0 ? (
            <span className="text-[10px] text-amber-700 font-bold block">Bal: {formatPKR(c.balance)}</span>
          ) : (
            <span className="text-[10px] text-emerald-700 font-semibold block">Fully Settled</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          {c.balance > 0 && can(currentUser?.role, 'manage_expenses') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCommission(c);
                setPaymentAmount(c.balance);
                setRecordPaymentModalOpen(true);
              }}
              className="h-7 text-[11px]"
            >
              Receive
            </Button>
          )}
          {c.agentPayoutStatus === 'Pending' && c.status === 'Received' && can(currentUser?.role, 'manage_expenses') && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handlePayoutAgent(c.id, c.agentName)}
              className="h-7 text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            >
              Payout Agent
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Agency Commissions & Financial Ledger"
        description="Real-time split computation, collection tracking, agent payouts, and operational expenses."
        actions={
          <div className="flex items-center gap-2">
            {can(currentUser?.role, 'manage_expenses') && (
              <Button onClick={() => setAddExpenseModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Record Expense
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Commission Earned"
          value={formatPKR(totalEarned)}
          subtitle="Closed transactions"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Commission Received"
          value={formatPKR(totalReceived)}
          trend={{ value: `${Math.round((totalReceived / Math.max(1, totalEarned)) * 100)}%`, isPositive: true, label: 'collected' }}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="Pending Receivables"
          value={formatPKR(totalPending)}
          subtitle="Token & Transfer balances"
          icon={<Clock className="h-4 w-4 text-amber-600" />}
        />
        <StatCard
          title="Agent Payouts Settled"
          value={formatPKR(totalAgentPayouts)}
          subtitle="Disbursed to team"
          icon={<CreditCard className="h-4 w-4 text-blue-600" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-[500px]">
          <TabsTrigger value="commissions">Commissions ({visibleCommissions.length})</TabsTrigger>
          <TabsTrigger value="payments">Receivables</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="summary">Summary & P&L</TabsTrigger>
        </TabsList>

        {/* Tab 1: Commissions Table */}
        <TabsContent value="commissions" className="pt-4">
          <DataTable
            data={visibleCommissions}
            columns={commissionColumns}
            searchPlaceholder="Search commission entries..."
          />
        </TabsContent>

        {/* Tab 2: Receivables Payment Tracking */}
        <TabsContent value="payments" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleCommissions
              .filter((c) => c.balance > 0)
              .map((c) => (
                <Card key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900">{c.propertyTitle}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">Deal Value: {formatPKR(c.dealValue)}</span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Agency Fee</span>
                      <span className="font-semibold text-slate-900">{formatPKR(c.totalAgencyCommission)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Pending Balance</span>
                      <span className="font-bold text-amber-700">{formatPKR(c.balance)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCommission(c);
                      setPaymentAmount(c.balance);
                      setRecordPaymentModalOpen(true);
                    }}
                    className="w-full text-xs"
                  >
                    Record Received Payment
                  </Button>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tab 3: Expenses Table */}
        <TabsContent value="expenses" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Agency Operating Overhead</CardTitle>
                <CardDescription>Rent, salaries, Zameen advertising package, fuel & utilities</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddExpenseModalOpen(true)} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Description Note</th>
                    <th className="py-2.5 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">{e.category}</td>
                      <td className="py-2.5 text-slate-500">{formatDate(e.date)}</td>
                      <td className="py-2.5 text-slate-600">{e.note || '-'}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatPKR(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Summary & P&L */}
        <TabsContent value="summary" className="pt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Profit & Loss (P&L) Breakdown</CardTitle>
              <CardDescription>Revenue vs payouts and operational costs</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummaryData}>
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
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="CommissionEarned" fill="#0F766E" radius={[4, 4, 0, 0]} name="Commission Gross" />
                  <Bar dataKey="AgentPayouts" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Agent Payouts" />
                  <Bar dataKey="Expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Overhead Expenses" />
                  <Bar dataKey="NetProfit" fill="#10B981" radius={[4, 4, 0, 0]} name="Agency Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={recordPaymentModalOpen} onOpenChange={setRecordPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Commission Payment</DialogTitle>
            <DialogDescription>
              Record pay order or online bank transfer received from buyer or seller.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4">
            {selectedCommission && (
              <div className="p-3 rounded-lg bg-slate-50 border text-xs space-y-1">
                <div className="font-semibold text-slate-900">{selectedCommission.propertyTitle}</div>
                <div className="flex justify-between text-slate-500">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-amber-700">{formatPKR(selectedCommission.balance)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Payment Amount Received (PKR)</label>
              <Input
                type="number"
                step="50000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-slate-400">{formatPKR(paymentAmount)}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRecordPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD EXPENSE MODAL */}
      <Dialog open={addExpenseModalOpen} onOpenChange={setAddExpenseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Agency Overhead Expense</DialogTitle>
            <DialogDescription>
              Keep your agency financial profit & loss accurate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Expense Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="Office rent">Office rent</option>
                <option value="Salaries">Salaries</option>
                <option value="Marketing — Zameen package">Marketing — Zameen package</option>
                <option value="Facebook ads">Facebook ads</option>
                <option value="Fuel">Fuel allowance</option>
                <option value="Utilities">Utilities & Generator</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Amount (PKR)</label>
              <Input
                type="number"
                step="10000"
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-slate-400">{formatPKR(expAmount)}</span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Invoice Note</label>
              <Input
                placeholder="e.g. November K-Electric bill & generator fuel"
                value={expNote}
                onChange={(e) => setExpNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

