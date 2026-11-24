import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Lead, LeadSource, LeadStatus, LeadTemperature, LeadInterest, PropertyType, Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { MaskedPhone } from '@/components/MaskedPhone';
import { AgentAvatar } from '@/components/AgentAvatar';
import { TimelineItem } from '@/components/TimelineItem';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { formatDate, formatPKR, formatPhone } from '@/lib/format';
import { can } from '@/lib/permissions';
import { checkLeadPhoneDuplicate } from '@/lib/duplicates';
import {
  Plus,
  Table as TableIcon,
  Kanban,
  AlertTriangle,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  FileText,
  UserCheck,
  UserPlus,
  Building,
  DollarSign,
  Briefcase,
  Share2,
  Clock,
  ExternalLink,
} from 'lucide-react';

const STATUS_COLUMNS: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Visit Scheduled',
  'Visit Done',
  'Negotiation',
  'Won',
  'Lost',
];

export const LeadsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    leads,
    addLead,
    updateLead,
    reassignLeads,
    addLeadActivity,
    clients,
    properties,
    users,
    addDeal,
    addTask,
    addVisit,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAgentId, setBulkAgentId] = useState<string>('');

  const [searchParams] = useSearchParams();
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>(() => {
    return searchParams.get('filter') === 'unassigned' ? 'unassigned' : 'all';
  });
  const [filterTemp, setFilterTemp] = useState<string>('all');

  useEffect(() => {
    if (searchParams.get('filter') === 'unassigned') {
      setFilterAgent('unassigned');
    }
  }, [searchParams]);

  // New Lead Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState<LeadSource>('Zameen');
  const [formInterest, setFormInterest] = useState<LeadInterest>('Buy');
  const [formPropertyType, setFormPropertyType] = useState<PropertyType>('House');
  const [formBudgetMin, setFormBudgetMin] = useState<number>(30000000);
  const [formBudgetMax, setFormBudgetMax] = useState<number>(60000000);
  const [formLocation, setFormLocation] = useState('DHA Phase 6');
  const [formAgentId, setFormAgentId] = useState('usr-3'); // Ayesha Khan
  const [formTemperature, setFormTemperature] = useState<LeadTemperature>('Hot');
  const [formNotes, setFormNotes] = useState('');
  const [isDuplicateAllowed, setIsDuplicateAllowed] = useState(false);

  // Activity Logger in Detail Sheet
  const [activityType, setActivityType] = useState<'Call' | 'WhatsApp' | 'Meeting' | 'Note'>('Call');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityOutcome, setActivityOutcome] = useState('');

  // Agents lookup map
  const agentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u.id] = u.name;
    });
    return map;
  }, [users]);

  // DUPLICATE PHONE CHECK
  const duplicateMatch = useMemo(() => {
    if (!formPhone || formPhone.length < 8) return null;
    return checkLeadPhoneDuplicate(formPhone, leads, clients, agentsMap);
  }, [formPhone, leads, clients, agentsMap]);

  // Role filtering: Agents see only own leads
  const roleFilteredLeads = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return leads.filter((l) => l.assignedAgentId === currentUser.id);
    }
    return leads;
  }, [leads, currentUser]);

  const activeAgents = useMemo(() => {
    return users.filter((u) => u.role === 'Agent' && u.active);
  }, [users]);

  const handleAssignSingleLead = (leadId: string, targetAgentId: string) => {
    reassignLeads([leadId], targetAgentId);
    const agentName = agentsMap[targetAgentId] || 'Agent';
    toast.success(`Lead successfully assigned to ${agentName}.`);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, assignedAgentId: targetAgentId } : null));
    }
  };

  // UI Filters
  const displayedLeads = useMemo(() => {
    return roleFilteredLeads.filter((lead) => {
      if (filterSource !== 'all' && lead.source !== filterSource) return false;
      if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
      if (filterAgent !== 'all') {
        if (filterAgent === 'unassigned') {
          if (lead.assignedAgentId) return false;
        } else if (lead.assignedAgentId !== filterAgent) {
          return false;
        }
      }
      if (filterTemp !== 'all' && lead.temperature !== filterTemp) return false;
      return true;
    });
  }, [roleFilteredLeads, filterSource, filterStatus, filterAgent, filterTemp]);

  // Matching properties for selected lead
  const matchingProperties = useMemo(() => {
    if (!selectedLead) return [];
    return properties.filter((p) => {
      if (p.status !== 'Available') return false;
      // Budget matching
      const matchesBudget = p.price >= selectedLead.budgetMin * 0.7 && p.price <= selectedLead.budgetMax * 1.3;
      // Location matching
      const matchesLocation = selectedLead.preferredLocations.some((loc) =>
        p.area.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(p.area.toLowerCase())
      );
      return matchesBudget || matchesLocation;
    }).slice(0, 4);
  }, [selectedLead, properties]);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      toast.error('Please enter full name and mobile phone.');
      return;
    }

    const created = addLead({
      name: formName,
      phone: formPhone,
      source: formSource,
      interest: formInterest,
      propertyType: formPropertyType,
      budgetMin: Number(formBudgetMin),
      budgetMax: Number(formBudgetMax),
      preferredLocations: [formLocation],
      assignedAgentId: formAgentId,
      temperature: formTemperature,
      status: 'New',
      notes: formNotes,
      isDuplicate: !!duplicateMatch,
    });

    toast.success(`Lead for ${created.name} added successfully.`);
    setAddLeadOpen(false);
    // Reset form
    setFormName('');
    setFormPhone('');
    setFormNotes('');
    setIsDuplicateAllowed(false);
  };

  const handleBulkReassign = () => {
    if (selectedLeadIds.length === 0 || !bulkAgentId) return;
    reassignLeads(selectedLeadIds, bulkAgentId);
    toast.success(`Reassigned ${selectedLeadIds.length} leads to ${agentsMap[bulkAgentId] || 'Agent'}.`);
    setSelectedLeadIds([]);
    setBulkAgentId('');
  };

  const handleLogActivity = () => {
    if (!selectedLead || !activityDesc) return;
    addLeadActivity(selectedLead.id, {
      type: activityType,
      description: activityDesc,
      outcome: activityOutcome,
      authorName: currentUser?.name || 'Agent',
    });
    toast.success(`${activityType} activity logged.`);
    setActivityDesc('');
    setActivityOutcome('');
    // refresh selected lead from store
    const updated = leads.find((l) => l.id === selectedLead.id);
    if (updated) setSelectedLead(updated);
  };

  const handleConvertToDeal = () => {
    if (!selectedLead) return;
    const matchedProp = matchingProperties[0] || properties[0];
    const newDeal = addDeal({
      title: `${selectedLead.name} - ${matchedProp.title}`,
      propertyId: matchedProp.id,
      buyerClientId: 'client-1',
      sellerClientId: 'client-2',
      listingAgentId: matchedProp.listingAgentId,
      sellingAgentId: selectedLead.assignedAgentId || currentUser?.id || 'usr-3',
      dealValue: matchedProp.price,
      tokenAmount: Math.round(matchedProp.price * 0.05),
      tokenDate: new Date().toISOString(),
      stage: 'Negotiation',
      paymentSchedule: [
        { id: `mil-1`, milestone: 'Bayana Token Deposit', amount: Math.round(matchedProp.price * 0.05), dueDate: new Date().toISOString(), status: 'Pending' },
      ],
      commissionSplit: {
        buyerCommissionPercent: 1.0,
        sellerCommissionPercent: 1.0,
        totalAgencyCommission: Math.round(matchedProp.price * 0.02),
        agentSharePercent: 40,
        agentShareAmount: Math.round(matchedProp.price * 0.02 * 0.4),
        referralSharePercent: 0,
        referralShareAmount: 0,
        agencyNetProfit: Math.round(matchedProp.price * 0.02 * 0.6),
        isLocked: false,
        lockedBy: currentUser?.name || 'Owner',
        lockedAt: new Date().toISOString(),
      },
    });

    updateLead(selectedLead.id, { status: 'Negotiation' });
    toast.success(`Lead successfully converted to Deal (${newDeal.dealCode})!`);
    setSelectedLead(null);
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Lead Name',
      sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-2">
          {can(currentUser?.role, 'reassign_lead') && (
            <input
              type="checkbox"
              checked={selectedLeadIds.includes(lead.id)}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedLeadIds((prev) =>
                  prev.includes(lead.id) ? prev.filter((id) => id !== lead.id) : [...prev, lead.id]
                );
              }}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <span>{lead.name}</span>
              {lead.isDuplicate && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  DUP
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              <MaskedPhone phone={lead.phone} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (lead) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {lead.source}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (lead) => <StatusBadge status={lead.status} dot />,
    },
    {
      key: 'temperature',
      header: 'Temp',
      sortable: true,
      render: (lead) => <StatusBadge status={lead.temperature} />,
    },
    {
      key: 'interest',
      header: 'Interest & Type',
      render: (lead) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{lead.interest}</span>
          <span className="text-slate-400"> • </span>
          <span className="text-slate-600">{lead.propertyType}</span>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget Range',
      render: (lead) => (
        <div className="text-xs font-medium text-emerald-700">
          {formatPKR(lead.budgetMin)} - {formatPKR(lead.budgetMax)}
        </div>
      ),
    },
    {
      key: 'preferredLocations',
      header: 'Location',
      render: (lead) => (
        <span className="text-xs text-slate-600 truncate max-w-[120px] inline-block">
          {lead.preferredLocations.join(', ')}
        </span>
      ),
    },
    {
      key: 'assignedAgentId',
      header: 'Assigned Agent',
      render: (lead) => {
        if (!lead.assignedAgentId) {
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {can(currentUser?.role, 'reassign_lead') ? (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignSingleLead(lead.id, e.target.value);
                    }
                  }}
                  className="h-7 px-2 rounded-md border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-900 cursor-pointer hover:bg-amber-100 focus:outline-none"
                  title="Click to assign to an agent"
                >
                  <option value="" disabled>⚠️ Unassigned — Assign...</option>
                  {activeAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Unassigned
                </span>
              )}
            </div>
          );
        }
        const agentName = agentsMap[lead.assignedAgentId] || 'Agent';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <AgentAvatar name={agentName} size="sm" />
            <span className="text-slate-800 font-medium">{agentName}</span>
          </div>
        );
      },
    },
    {
      key: 'nextFollowUpDate',
      header: 'Next Follow-up',
      sortable: true,
      render: (lead) => {
        if (!lead.nextFollowUpDate) return <span className="text-slate-400 text-xs">-</span>;
        const isOverdue = new Date(lead.nextFollowUpDate) < new Date();
        return (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
            {formatDate(lead.nextFollowUpDate)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inquiries & Leads"
        description="Capture, verify, and nurture real estate buyers and investors across Karachi, Lahore & Islamabad."
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="inline-flex rounded-[8px] bg-white p-1 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'table' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'kanban' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="Kanban Pipeline View"
              >
                <Kanban className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => setAddLeadOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        }
      />

      {/* Filter and Bulk Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Filter:</span>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            {STATUS_COLUMNS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Sources</option>
            <option value="Zameen">Zameen</option>
            <option value="Facebook">Facebook</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Phone">Phone</option>
            <option value="Instagram">Instagram</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Referral">Referral</option>
          </select>

          {/* Temperature Filter */}
          <select
            value={filterTemp}
            onChange={(e) => setFilterTemp(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Temperatures</option>
            <option value="Hot">Hot 🔥</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>

          {/* Agent Filter for Owner/Manager */}
          {can(currentUser?.role, 'view_all_leads') && (
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="all">All Agents</option>
              <option value="unassigned">⚠️ Unassigned Leads ({leads.filter((l) => !l.assignedAgentId).length})</option>
              {users
                .filter((u) => u.role === 'Agent')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {!a.active ? '(Inactive)' : ''}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Bulk Action Controls */}
        {selectedLeadIds.length > 0 && can(currentUser?.role, 'reassign_lead') && (
          <div className="flex items-center gap-2 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-900">{selectedLeadIds.length} Selected</span>
            <select
              value={bulkAgentId}
              onChange={(e) => setBulkAgentId(e.target.value)}
              className="h-7 px-2 rounded border border-emerald-300 bg-white text-xs"
            >
              <option value="">Reassign to Agent...</option>
              {users
                .filter((u) => u.role === 'Agent' && u.active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
            <Button size="sm" onClick={handleBulkReassign} disabled={!bulkAgentId} className="h-7 text-xs px-2.5">
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <DataTable
          data={displayedLeads}
          columns={columns}
          searchPlaceholder="Search leads by name, phone, or location..."
          searchFilter={(lead, q) =>
            lead.name.toLowerCase().includes(q) ||
            lead.phone.includes(q) ||
            lead.preferredLocations.some((loc) => loc.toLowerCase().includes(q))
          }
          onRowClick={(lead) => setSelectedLead(lead)}
        />
      ) : (
        /* Kanban Pipeline View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => {
            const statusLeads = displayedLeads.filter((l) => l.status === status);

            return (
              <div key={status} className="w-72 shrink-0 flex flex-col rounded-[10px] bg-slate-100/70 p-3 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-xs font-semibold text-slate-500">{statusLeads.length}</span>
                  </div>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[650px] pr-1">
                  {statusLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="rounded-[8px] border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-md hover:border-emerald-300 cursor-pointer space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            <MaskedPhone phone={lead.phone} />
                          </div>
                        </div>
                        <StatusBadge status={lead.temperature} />
                      </div>

                      <div className="text-[11px] font-medium text-emerald-700">
                        {formatPKR(lead.budgetMin)} - {formatPKR(lead.budgetMax)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                        <span>{lead.preferredLocations[0]}</span>
                        {lead.assignedAgentId ? (
                          <AgentAvatar name={agentsMap[lead.assignedAgentId] || 'Agent'} size="sm" />
                        ) : (
                          <span className="px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-[10px] border border-amber-300">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {statusLeads.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400 italic">No leads in stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD LEAD DIALOG WITH REAL-TIME DUPLICATE DETECTION */}
      {/* ============================================================== */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Capture New Lead Inquiry</DialogTitle>
            <DialogDescription>
              Enter buyer requirement details. Real-time duplicate protection is active.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-4">
            {/* DUPLICATE WARNING CALLOUT */}
            {duplicateMatch && !isDuplicateAllowed && (
              <div className="rounded-[8px] bg-amber-50 border border-amber-200 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Duplicate Number Detected!
                </div>
                <p className="text-amber-800">
                  This phone number already exists in your agency CRM assigned to{' '}
                  <strong>{duplicateMatch.assignedAgentName}</strong> (via {duplicateMatch.sourceOrType},{' '}
                  {duplicateMatch.dateStr}).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const match = leads.find((l) => l.id === duplicateMatch.id);
                      if (match) setSelectedLead(match);
                      setAddLeadOpen(false);
                    }}
                    className="h-7 text-xs bg-white text-slate-800"
                  >
                    Open Existing Lead
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsDuplicateAllowed(true)}
                    className="h-7 text-xs bg-amber-100 text-amber-900 hover:bg-amber-200"
                  >
                    Add Anyway (Mark as Duplicate)
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Tariq Mansoor"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Mobile Phone (Pakistani) *</label>
                <Input
                  required
                  placeholder="0300-1234567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Lead Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as LeadSource)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                >
                  <option value="Zameen">Zameen.com</option>
                  <option value="Facebook">Facebook Ads</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Phone">Phone Inquiry</option>
                  <option value="Walk-in">Office Walk-in</option>
                  <option value="Referral">Client Referral</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Property Type</label>
                <select
                  value={formPropertyType}
                  onChange={(e) => setFormPropertyType(e.target.value as PropertyType)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                >
                  <option value="House">House / Bungalow</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Plot">Residential / Commercial Plot</option>
                  <option value="Commercial Shop">Commercial Shop</option>
                  <option value="Office">Office Space</option>
                  <option value="Farmhouse">Farmhouse</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Min Budget (PKR)</label>
                <Input
                  type="number"
                  step="5000000"
                  value={formBudgetMin}
                  onChange={(e) => setFormBudgetMin(Number(e.target.value))}
                />
                <span className="text-[10px] text-slate-400">{formatPKR(formBudgetMin)}</span>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Max Budget (PKR)</label>
                <Input
                  type="number"
                  step="5000000"
                  value={formBudgetMax}
                  onChange={(e) => setFormBudgetMax(Number(e.target.value))}
                />
                <span className="text-[10px] text-slate-400">{formatPKR(formBudgetMax)}</span>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Preferred Location</label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                >
                  <option value="DHA Phase 6">DHA Phase 6 (Karachi)</option>
                  <option value="DHA Phase 5">DHA Phase 5 (Karachi)</option>
                  <option value="DHA Phase 8">DHA Phase 8 (Karachi)</option>
                  <option value="Clifton Block 4">Clifton (Karachi)</option>
                  <option value="Bahria Town Karachi">Bahria Town Karachi</option>
                  <option value="DHA Phase 5 Lahore">DHA Phase 5 (Lahore)</option>
                  <option value="F-7 Islamabad">F-7 (Islamabad)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Assign Field Agent</label>
                <select
                  value={formAgentId}
                  onChange={(e) => setFormAgentId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                >
                  <option value="">Unassigned (Queue for intake)</option>
                  {users
                    .filter((u) => u.role === 'Agent' && u.active)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Inquiry Notes / Specific Requirements</label>
              <Input
                placeholder="e.g. 500 Sq Yd west open, near masjid, direct owner preference..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Assign Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* LEAD DETAIL SHEET (SIDEBAR SLIDEOUT) */}
      {/* ============================================================== */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        {selectedLead && (
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <SheetTitle className="text-xl flex items-center gap-2">
                    {selectedLead.name}
                    {selectedLead.isDuplicate && (
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                        DUPLICATE LEAD
                      </span>
                    )}
                  </SheetTitle>
                  <SheetDescription>
                    Captured from {selectedLead.source} on {formatDate(selectedLead.createdAt)}
                  </SheetDescription>
                </div>
                <StatusBadge status={selectedLead.status} />
              </div>
            </SheetHeader>

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Client Contact</span>
                <MaskedPhone phone={selectedLead.phone} />
              </div>

              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="default" onClick={handleConvertToDeal} className="gap-1 bg-emerald-700 text-xs">
                  <Briefcase className="h-3.5 w-3.5" />
                  Convert to Deal
                </Button>
              </div>
            </div>

            {/* Assignment & Reassignment Control */}
            {can(currentUser?.role, 'reassign_lead') && (
              <div
                className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                  !selectedLead.assignedAgentId
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className={`h-4 w-4 ${!selectedLead.assignedAgentId ? 'text-amber-600' : 'text-emerald-700'}`} />
                    <span className="font-bold text-slate-900">
                      {!selectedLead.assignedAgentId ? 'Unassigned Lead (Needs Field Agent)' : 'Assigned Field Agent'}
                    </span>
                  </div>
                  {!selectedLead.assignedAgentId && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Pending Assignment
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-600">
                    {!selectedLead.assignedAgentId
                      ? 'Select an agent to assign this buyer inquiry:'
                      : `Currently handled by ${agentsMap[selectedLead.assignedAgentId] || 'Agent'}. Reassign:`}
                  </span>
                  <select
                    value={selectedLead.assignedAgentId || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignSingleLead(selectedLead.id, e.target.value);
                      }
                    }}
                    className="h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="" disabled>Choose Agent to Assign...</option>
                    {activeAgents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Lead Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Interest</span>
                <p className="font-semibold text-slate-900">{selectedLead.interest}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Property Type</span>
                <p className="font-semibold text-slate-900">{selectedLead.propertyType}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Budget Range</span>
                <p className="font-semibold text-emerald-700">{formatPKR(selectedLead.budgetMin)}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Assigned Agent</span>
                <p className={`font-semibold ${selectedLead.assignedAgentId ? 'text-slate-900' : 'text-amber-700'}`}>
                  {selectedLead.assignedAgentId ? agentsMap[selectedLead.assignedAgentId] : 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Matching Inventory Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-emerald-700" />
                  Matching Agency Inventory ({matchingProperties.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchingProperties.map((prop) => (
                  <div key={prop.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span className="truncate">{prop.propertyCode}</span>
                      <PriceText amount={prop.price} />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{prop.title}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{prop.area}</span>
                      <span className="text-emerald-700 font-semibold">{prop.size} {prop.sizeUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Logger Form */}
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                Log Interaction & Next Follow-Up
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Channel</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full h-8 rounded border border-slate-200 bg-white text-xs px-2"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Chat</option>
                    <option value="Meeting">Office / Site Meeting</option>
                    <option value="Note">Internal Note</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Outcome Summary</label>
                  <Input
                    placeholder="e.g. Requested visit tomorrow at 4 PM"
                    value={activityOutcome}
                    onChange={(e) => setActivityOutcome(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-600 font-medium">Notes & Feedback</label>
                <Input
                  placeholder="Detail discussion points with client..."
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>

              <Button size="sm" onClick={handleLogActivity} disabled={!activityDesc} className="w-full text-xs">
                Save Activity to Timeline
              </Button>
            </div>

            {/* Activity Timeline List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Activity Audit History ({selectedLead.activities?.length || 0})
              </h4>
              <div className="space-y-1">
                {selectedLead.activities?.map((act, idx) => (
                  <TimelineItem
                    key={act.id}
                    type={act.type}
                    description={act.description}
                    outcome={act.outcome}
                    createdAt={act.createdAt}
                    authorName={act.authorName}
                    isLast={idx === (selectedLead.activities?.length || 0) - 1}
                  />
                ))}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

