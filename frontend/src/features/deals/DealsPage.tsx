import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Deal, DealStage } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { AgentAvatar } from '@/components/AgentAvatar';
import { TimelineItem } from '@/components/TimelineItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { calculateCommission } from '@/lib/commission';
import {
  Plus,
  Lock,
  Unlock,
  AlertTriangle,
  Briefcase,
  User,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const DEAL_STAGES: DealStage[] = [
  'Negotiation',
  'Token Received',
  'Agreement Signed',
  'Transfer in Process',
  'Closed Won',
  'Closed Lost',
];

export const DealsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { deals, moveDealStage, updateCommissionSplit, properties, clients, users } = useAppStore();

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // Edit commission state
  const [editBuyerPct, setEditBuyerPct] = useState(1.0);
  const [editSellerPct, setEditSellerPct] = useState(1.0);
  const [editAgentSharePct, setEditAgentSharePct] = useState(40);
  const [editReferralSharePct, setEditReferralSharePct] = useState(0);

  const agentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [clients]);

  // Role filtering: Agents see own deals
  const roleFilteredDeals = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return deals.filter((d) => d.sellingAgentId === currentUser.id || d.listingAgentId === currentUser.id);
    }
    return deals;
  }, [deals, currentUser]);

  const handleStageDragOrMove = (dealId: string, newStage: DealStage) => {
    moveDealStage(dealId, newStage, currentUser?.name || 'Owner');
    toast.success(`Deal moved to ${newStage}. Pipeline updated.`);
    if (selectedDeal && selectedDeal.id === dealId) {
      const updated = deals.find((d) => d.id === dealId);
      if (updated) setSelectedDeal(updated);
    }
  };

  const handleOpenUnlockModal = (deal: Deal) => {
    if (!can(currentUser?.role, 'edit_locked_commission')) {
      toast.error('Only Agency Owner (Imran Qureshi) can unlock and edit commission splits.');
      return;
    }
    setEditBuyerPct(deal.commissionSplit.buyerCommissionPercent);
    setEditSellerPct(deal.commissionSplit.sellerCommissionPercent);
    setEditAgentSharePct(deal.commissionSplit.agentSharePercent);
    setEditReferralSharePct(deal.commissionSplit.referralSharePercent);
    setUnlockModalOpen(true);
  };

  const handleSaveCommissionSplit = () => {
    if (!selectedDeal) return;
    updateCommissionSplit(
      selectedDeal.id,
      editBuyerPct,
      editSellerPct,
      editAgentSharePct,
      editReferralSharePct,
      currentUser?.name || 'Owner'
    );
    toast.success('Commission split updated and re-locked into agency audit ledger.');
    setUnlockModalOpen(false);
    // Refresh selected deal
    const updated = deals.find((d) => d.id === selectedDeal.id);
    if (updated) setSelectedDeal(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Deals & Bayana Pipeline"
        description="Pakistan transaction milestones: Negotiation, Token (Bayana), Agreement to Transfer and Commission settlement."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              Locked Commission Protection Active
            </div>
          </div>
        }
      />

      {/* Kanban Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = roleFilteredDeals.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

          return (
            <div
              key={stage}
              className="w-80 shrink-0 flex flex-col rounded-[10px] bg-slate-100/70 p-3 border border-slate-200"
            >
              {/* Stage Header */}
              <div className="pb-2.5 mb-2.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={stage} />
                    <span className="text-xs font-bold text-slate-700">({stageDeals.length})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pt-1">
                    Vol: {formatPKR(stageTotal)}
                  </div>
                </div>
              </div>

              {/* Cards in Stage */}
              <div className="space-y-3 overflow-y-auto max-h-[680px] pr-1">
                {stageDeals.map((deal) => {
                  const isStuck = deal.stage === 'Token Received' && deal.daysInStage > 14;
                  const agentName = agentsMap[deal.sellingAgentId] || 'Agent';

                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`rounded-[8px] border bg-white p-3.5 shadow-2xs hover:shadow-md cursor-pointer space-y-2.5 transition-all ${
                        isStuck ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-900">{deal.dealCode}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            deal.daysInStage > 14
                              ? 'bg-red-50 text-red-700 font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {deal.daysInStage} days in stage
                        </span>
                      </div>

                      <h4 className="font-heading font-semibold text-xs text-slate-900 line-clamp-2">
                        {deal.title}
                      </h4>

                      <div className="text-xs space-y-0.5">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Buyer:</span>
                          <span className="text-slate-800 font-medium">{clientsMap[deal.buyerClientId] || 'Buyer'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Seller:</span>
                          <span className="text-slate-800 font-medium">{clientsMap[deal.sellerClientId] || 'Seller'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Value</span>
                          <PriceText amount={deal.dealValue} className="text-sm font-bold" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <AgentAvatar name={agentName} size="sm" />
                          <span className="text-[11px] text-slate-700 font-medium">{agentName.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px]">
                        <span className="text-slate-400">Move:</span>
                        <div className="flex gap-1">
                          {stage !== 'Closed Won' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIdx = DEAL_STAGES.indexOf(stage) + 1;
                                if (nextIdx < DEAL_STAGES.length) {
                                  handleStageDragOrMove(deal.id, DEAL_STAGES[nextIdx]);
                                }
                              }}
                              className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* DEAL DETAIL SHEET WITH LOCKED COMMISSION SPLIT */}
      {/* ============================================================== */}
      <Sheet open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        {selectedDeal && (
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-700">{selectedDeal.dealCode}</div>
                  <SheetTitle className="text-lg">{selectedDeal.title}</SheetTitle>
                  <SheetDescription>
                    Created on {formatDate(selectedDeal.createdAt)} • Days in stage: {selectedDeal.daysInStage}
                  </SheetDescription>
                </div>
                <StatusBadge status={selectedDeal.stage} />
              </div>
            </SheetHeader>

            {/* Quick Transition Selector */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Change Pipeline Stage:</span>
              <select
                value={selectedDeal.stage}
                onChange={(e) => handleStageDragOrMove(selectedDeal.id, e.target.value as DealStage)}
                className="h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-semibold"
              >
                {DEAL_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Parties Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Buyer</span>
                <p className="font-semibold text-slate-900">{clientsMap[selectedDeal.buyerClientId] || 'Buyer'}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Seller</span>
                <p className="font-semibold text-slate-900">{clientsMap[selectedDeal.sellerClientId] || 'Seller'}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Deal Value</span>
                <p className="font-semibold text-emerald-700">{formatPKR(selectedDeal.dealValue)}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Bayana Token</span>
                <p className="font-semibold text-slate-900">{formatPKR(selectedDeal.tokenAmount)}</p>
              </div>
            </div>

            {/* ============================================================== */}
            {/* LOCKED COMMISSION SPLIT CARD (CRITICAL FEATURE) */}
            {/* ============================================================== */}
            <Card className="border-emerald-200 bg-emerald-50/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-800">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900">
                        Commission Split Ledger (Legally Locked)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {selectedDeal.commissionSplit.isLocked
                          ? `Locked on ${formatDate(selectedDeal.commissionSplit.lockedAt)} by ${selectedDeal.commissionSplit.lockedBy}`
                          : 'Unlocked for editing'}
                      </p>
                    </div>
                  </div>

                  {can(currentUser?.role, 'edit_locked_commission') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenUnlockModal(selectedDeal)}
                      className="h-7 text-xs border-emerald-300 text-emerald-900 bg-white"
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Edit Split
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Agency Total</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatPKR(selectedDeal.commissionSplit.totalAgencyCommission)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({selectedDeal.commissionSplit.buyerCommissionPercent}% Buyer + {selectedDeal.commissionSplit.sellerCommissionPercent}% Seller)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Agent Share</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatPKR(selectedDeal.commissionSplit.agentShareAmount)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({selectedDeal.commissionSplit.agentSharePercent}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Referral Partner</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedDeal.commissionSplit.referralShareAmount > 0
                        ? formatPKR(selectedDeal.commissionSplit.referralShareAmount)
                        : 'PKR 0'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {selectedDeal.referralPartnerName || 'No referral'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Agency Net</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {formatPKR(selectedDeal.commissionSplit.agencyNetProfit)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Retained</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Milestone Schedule */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-700" />
                Bayana & Transfer Payment Schedule
              </h4>
              <div className="space-y-2 text-xs">
                {selectedDeal.paymentSchedule.map((mil) => (
                  <div key={mil.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{mil.milestone}</div>
                      <div className="text-[11px] text-slate-400">Due: {formatDate(mil.dueDate)}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <PriceText amount={mil.amount} />
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mil.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {mil.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deal Stage Audit History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pipeline Progression Log
              </h4>
              <div className="space-y-1">
                {selectedDeal.stageHistory.map((sh, idx) => (
                  <TimelineItem
                    key={idx}
                    type="StatusChange"
                    description={`Advanced to ${sh.stage}. ${sh.note || ''}`}
                    createdAt={sh.date}
                    authorName={sh.updatedBy}
                    isLast={idx === selectedDeal.stageHistory.length - 1}
                  />
                ))}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* ============================================================== */}
      {/* UNLOCK COMMISSION SPLIT MODAL (OWNER ONLY) */}
      {/* ============================================================== */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-emerald-700" />
              Adjust Locked Commission Split
            </DialogTitle>
            <DialogDescription>
              Owner authorization required. All changes are logged to the Agency Activity Audit Log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Buyer Side Commission %</label>
                <Input
                  type="number"
                  step="0.25"
                  value={editBuyerPct}
                  onChange={(e) => setEditBuyerPct(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Seller Side Commission %</label>
                <Input
                  type="number"
                  step="0.25"
                  value={editSellerPct}
                  onChange={(e) => setEditSellerPct(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Selling Agent Cut %</label>
                <Input
                  type="number"
                  step="5"
                  value={editAgentSharePct}
                  onChange={(e) => setEditAgentSharePct(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Referral Partner Cut %</label>
                <Input
                  type="number"
                  step="5"
                  value={editReferralSharePct}
                  onChange={(e) => setEditReferralSharePct(Number(e.target.value))}
                />
              </div>
            </div>

            {selectedDeal && (
              <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Agency Gross:</span>
                  <span className="font-bold text-slate-900">
                    {formatPKR(
                      Math.round(
                        (selectedDeal.dealValue * (editBuyerPct + editSellerPct)) / 100
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Agent Payout:</span>
                  <span className="font-semibold">
                    {formatPKR(
                      Math.round(
                        (selectedDeal.dealValue * (editBuyerPct + editSellerPct) * (editAgentSharePct / 100)) / 100
                      )
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUnlockModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveCommissionSplit}>
              Save & Lock Split
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

