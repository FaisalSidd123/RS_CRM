import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Lead, Property, Client, Deal, SiteVisit, Task, CommissionEntry,
  Expense, WhatsAppRule, WhatsAppTemplate, WhatsAppLog,
  ActivityLogEntry, NotificationItem, User, DealStage, VisitFeedback, TaskPriority, TaskType,
  LeadTemperature, LeadStatus, LeadSource, LeadInterest, PropertyType
} from '@/types';
import { INITIAL_USERS } from '@/data/users';
import { INITIAL_WHATSAPP_RULES, INITIAL_WHATSAPP_TEMPLATES } from '@/data/whatsapp';
import { calculateCommission } from '@/lib/commission';
import { formatISO } from 'date-fns';

interface AgencyProfile {
  name: string;
  tagline: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  plan: 'Starter' | 'Growth' | 'Agency Pro';
  usedAgents: number;
  maxAgents: number;
  defaultBuyerCommission: number;
  defaultSellerCommission: number;
  defaultAgentShare: number;
}

const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  name: 'Crescent Realty & Builders',
  tagline: 'Premier Luxury Real Estate Advisory & Project Marketing',
  city: 'Karachi',
  address: 'Commercial Avenue, DHA Phase 6, Karachi',
  phone: '021-35841290 / 0300-8245190',
  email: 'info@crescentrealty.pk',
  plan: 'Growth',
  usedAgents: 8,
  maxAgents: 15,
  defaultBuyerCommission: 1.0,
  defaultSellerCommission: 1.0,
  defaultAgentShare: 40.0,
};

interface AppState {
  users: User[];
  leads: Lead[];
  properties: Property[];
  clients: Client[];
  deals: Deal[];
  visits: SiteVisit[];
  tasks: Task[];
  commissions: CommissionEntry[];
  expenses: Expense[];
  whatsappRules: WhatsAppRule[];
  whatsappTemplates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  activityLogs: ActivityLogEntry[];
  notifications: NotificationItem[];
  agencyProfile: AgencyProfile;

  // Leads
  fetchBackendLeads: () => Promise<void>;
  claimLead: (leadId: string, managerId: string) => Promise<{ success: boolean; message: string }>;
  releaseLeadLock: (leadId: string, userId: string) => Promise<{ success: boolean; message: string }>;
  assignLeadToAgent: (leadId: string, agentId: string, userId: string) => Promise<{ success: boolean; message: string }>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'activities'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  reassignLeads: (leadIds: string[], targetAgentId: string) => void;
  addLeadActivity: (leadId: string, activity: { type: any; description: string; outcome?: string; authorName: string }) => void;

  // Properties
  addProperty: (property: Omit<Property, 'id' | 'propertyCode' | 'listedDate' | 'updatedAt'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'linkedPropertyIds' | 'linkedDealIds'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Deals
  addDeal: (deal: Omit<Deal, 'id' | 'dealCode' | 'createdAt' | 'daysInStage' | 'stageUpdatedAt' | 'stageHistory'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  moveDealStage: (dealId: string, targetStage: DealStage, updatedBy: string, note?: string) => void;
  updateCommissionSplit: (
    dealId: string,
    buyerPercent: number,
    sellerPercent: number,
    agentSharePercent: number,
    referralSharePercent: number,
    updatedBy: string
  ) => void;

  // Visits
  addVisit: (visit: Omit<SiteVisit, 'id' | 'createdAt'>) => SiteVisit;
  updateVisit: (id: string, updates: Partial<SiteVisit>) => void;
  completeVisit: (id: string, feedback: VisitFeedback, notes: string, nextFollowUp?: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string, outcomeNote?: string) => void;

  // Commissions & Expenses
  updateCommissionPayment: (id: string, receivedIncrement: number) => void;
  recordAgentPayout: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // WhatsApp
  toggleWhatsAppRule: (ruleId: string) => void;
  addWhatsAppLog: (recipientName: string, recipientPhone: string, templateName: string) => void;

  // Agents & Reassignment
  deactivateAgentAndReassign: (agentId: string, reassignToAgentId: string, performedBy: string) => void;

  // Activity & Notifications
  logActivity: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Settings
  updateAgencyProfile: (updates: Partial<AgencyProfile>) => void;
  resetDemoData: () => void;
}

function mapBackendLead(bLead: any): Lead {
  const normTemp: LeadTemperature = 
    bLead.temperature?.toLowerCase() === 'warm' ? 'Warm' :
    bLead.temperature?.toLowerCase() === 'cold' ? 'Cold' : 'Hot';

  const normStatus: LeadStatus = 
    bLead.status?.toLowerCase() === 'contacted' ? 'Contacted' :
    bLead.status?.toLowerCase() === 'qualified' ? 'Qualified' :
    bLead.status?.toLowerCase() === 'won' ? 'Won' :
    bLead.status?.toLowerCase() === 'lost' ? 'Lost' : 'New';

  const normSource: LeadSource = 
    bLead.source?.toLowerCase() === 'facebook' ? 'Facebook' :
    bLead.source?.toLowerCase() === 'zameen' ? 'Zameen' : 'WhatsApp';

  const normInterest: LeadInterest = 
    bLead.interest?.toLowerCase() === 'rent' ? 'Rent' :
    bLead.interest?.toLowerCase() === 'sell' ? 'Sell' :
    bLead.interest?.toLowerCase() === 'invest' ? 'Invest' : 'Buy';

  const normPropType: PropertyType = 
    bLead.propertyType?.toLowerCase() === 'apartment' ? 'Apartment' :
    bLead.propertyType?.toLowerCase() === 'house' ? 'House' :
    bLead.propertyType?.toLowerCase() === 'commercial shop' ? 'Commercial Shop' :
    bLead.propertyType?.toLowerCase() === 'office' ? 'Office' :
    bLead.propertyType?.toLowerCase() === 'farmhouse' ? 'Farmhouse' : 'Plot';

  return {
    id: bLead.id,
    name: bLead.fullName || bLead.name || 'WhatsApp Inquiry',
    phone: bLead.phone || bLead.rawPhone || '',
    email: bLead.email || '',
    source: normSource,
    interest: normInterest,
    propertyType: normPropType,
    budgetMin: bLead.budgetMin || 75000000,
    budgetMax: bLead.budgetMax || 75000000,
    preferredLocations: Array.isArray(bLead.preferredLocations) && bLead.preferredLocations.length > 0 
      ? bLead.preferredLocations 
      : ['DHA Karachi'],
    assignedAgentId: bLead.assignedAgentId || undefined,
    temperature: normTemp,
    status: normStatus,
    notes: bLead.inquiryNotes || bLead.notes || '',
    createdAt: bLead.createdAt || new Date().toISOString(),
    isDuplicate: bLead.isDuplicate || false,
    isLocked: !!bLead.isLocked,
    claimedByManagerId: bLead.claimedByManagerId || undefined,
    claimedByManagerName: bLead.claimedByManagerName || undefined,
    lockedAt: bLead.lockedAt || undefined,
    activities: Array.isArray(bLead.activities) && bLead.activities.length > 0
      ? bLead.activities
      : [
          {
            id: `act-${bLead.id}`,
            type: 'WhatsApp',
            description: bLead.inquiryNotes ? `WhatsApp: "${bLead.inquiryNotes}"` : 'WhatsApp inquiry received',
            createdAt: bLead.createdAt || new Date().toISOString(),
            authorName: 'Meta WhatsApp Engine',
          },
        ],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,
      leads: [],
      properties: [],
      clients: [],
      deals: [],
      visits: [],
      tasks: [],
      commissions: [],
      expenses: [],
      whatsappRules: INITIAL_WHATSAPP_RULES,
      whatsappTemplates: INITIAL_WHATSAPP_TEMPLATES,
      whatsappLogs: [],
      activityLogs: [],
      notifications: [],
      agencyProfile: DEFAULT_AGENCY_PROFILE,

      // Leads Actions
      fetchBackendLeads: async () => {
        try {
          const res = await fetch('http://localhost:5000/api/leads');
          if (!res.ok) return;
          const data = await res.json();
          if (data.success && Array.isArray(data.leads)) {
            const backendLeads: Lead[] = data.leads.map(mapBackendLead);
            set((state) => {
              const backendMap = new Map(backendLeads.map((l) => [l.id, l]));
              const updatedExisting = state.leads.map((l) => {
                const b = backendMap.get(l.id);
                if (!b) return l;
                const mergedActivities =
                  b.activities && b.activities.length >= (l.activities?.length || 0)
                    ? b.activities
                    : (l.activities || b.activities || []);
                return { ...l, ...b, activities: mergedActivities };
              });
              const existingIds = new Set(state.leads.map((l) => l.id));
              const freshOnes = backendLeads.filter((l) => !existingIds.has(l.id));
              return { leads: [...freshOnes, ...updatedExisting], users: INITIAL_USERS };
            });
          }
        } catch (err) {
          console.error('[PropertyOS] Failed to sync backend leads:', err);
        }
      },

      claimLead: async (leadId: string, managerId: string) => {
        try {
          const res = await fetch(`http://localhost:5000/api/leads/${leadId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ managerId }),
          });
          const data = await res.json();
          await get().fetchBackendLeads();
          if (res.ok && data.success) {
            return { success: true, message: data.message || 'Lead locked successfully.' };
          } else {
            return { success: false, message: data.message || 'Lead is locked by another manager.' };
          }
        } catch (err: any) {
          return { success: false, message: err.message || 'Failed to claim lead' };
        }
      },

      releaseLeadLock: async (leadId: string, userId: string) => {
        try {
          const res = await fetch(`http://localhost:5000/api/leads/${leadId}/release-lock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          const data = await res.json();
          await get().fetchBackendLeads();
          if (res.ok && data.success) {
            return { success: true, message: data.message || 'Lock released successfully.' };
          } else {
            return { success: false, message: data.message || 'Failed to release lock.' };
          }
        } catch (err: any) {
          return { success: false, message: err.message || 'Failed to release lock' };
        }
      },

      assignLeadToAgent: async (leadId: string, agentId: string, userId: string) => {
        try {
          const res = await fetch(`http://localhost:5000/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              assignedAgentId: agentId,
              status: 'qualified',
              isLocked: false,
            }),
          });
          const data = await res.json();
          await get().fetchBackendLeads();
          if (res.ok && data.lead) {
            return { success: true, message: 'Lead successfully assigned to field agent.' };
          } else {
            return { success: false, message: data.message || 'Failed to assign lead.' };
          }
        } catch (err: any) {
          return { success: false, message: err.message || 'Failed to assign lead' };
        }
      },

      addLead: (leadInput) => {
        const id = `lead-${Date.now()}`;
        const newLead: Lead = {
          ...leadInput,
          id,
          createdAt: formatISO(new Date()),
          activities: [
            {
              id: `act-${Date.now()}`,
              type: 'Note',
              description: 'Lead captured and entered into PropertyOS system.',
              createdAt: formatISO(new Date()),
              authorName: 'System / User',
            },
          ],
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        get().logActivity({
          userId: 'usr-1',
          userName: 'Imran Qureshi',
          userRole: 'Owner',
          action: 'Created Lead',
          record: `Created lead for ${newLead.name} (${newLead.source})`,
          ipAddress: '39.40.112.54',
        });
        return newLead;
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      deleteLead: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
        if (lead) {
          get().logActivity({
            userId: 'usr-1',
            userName: 'Imran Qureshi',
            userRole: 'Owner',
            action: 'Deleted Lead',
            record: `Deleted lead ${lead.name} (${lead.phone})`,
            ipAddress: '39.40.112.54',
          });
        }
      },

      reassignLeads: (leadIds, targetAgentId) => {
        const targetAgent = get().users.find((u) => u.id === targetAgentId);
        set((state) => ({
          leads: state.leads.map((l) =>
            leadIds.includes(l.id) ? { ...l, assignedAgentId: targetAgentId } : l
          ),
        }));
        get().logActivity({
          userId: 'usr-1',
          userName: 'Imran Qureshi',
          userRole: 'Owner',
          action: 'Reassigned Leads',
          record: `Bulk reassigned ${leadIds.length} leads to ${targetAgent?.name || 'Agent'}`,
          ipAddress: '39.40.112.54',
        });
      },

      addLeadActivity: (leadId, activity) => {
        const newAct = {
          ...activity,
          id: `act-${Date.now()}`,
          createdAt: formatISO(new Date()),
        };
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId ? { ...l, activities: [newAct, ...(l.activities || [])] } : l
          ),
        }));

        // Persist activity note to backend database
        fetch(`http://localhost:5000/api/leads/${leadId}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activity),
        }).catch((err) => console.error('[PropertyOS] Failed to save activity note to backend:', err));
      },

      // Properties Actions
      addProperty: (propertyInput) => {
        const codeNum = get().properties.length + 150;
        const code = `PK-DHA-0${codeNum}`;
        const newProp: Property = {
          ...propertyInput,
          id: `prop-${Date.now()}`,
          propertyCode: code,
          listedDate: formatISO(new Date()),
          updatedAt: formatISO(new Date()),
        };
        set((state) => ({ properties: [newProp, ...state.properties] }));
        get().logActivity({
          userId: 'usr-1',
          userName: 'Imran Qureshi',
          userRole: 'Owner',
          action: 'Added Property Listing',
          record: `Listed ${newProp.title} (${newProp.propertyCode})`,
          ipAddress: '39.40.112.54',
        });
        return newProp;
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: formatISO(new Date()) } : p
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({ properties: state.properties.filter((p) => p.id !== id) }));
      },

      // Clients Actions
      addClient: (clientInput) => {
        const newClient: Client = {
          ...clientInput,
          id: `client-${Date.now()}`,
          linkedPropertyIds: [],
          linkedDealIds: [],
          createdAt: formatISO(new Date()),
        };
        set((state) => ({ clients: [newClient, ...state.clients] }));
        get().logActivity({
          userId: 'usr-1',
          userName: 'Imran Qureshi',
          userRole: 'Owner',
          action: 'Created Client',
          record: `Created client record ${newClient.name} (${newClient.types.join(', ')})`,
          ipAddress: '39.40.112.54',
        });
        return newClient;
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      // Deals Actions
      addDeal: (dealInput) => {
        const dealCount = get().deals.length + 1025;
        const code = `D-${dealCount}`;
        const newDeal: Deal = {
          ...dealInput,
          id: `deal-${Date.now()}`,
          dealCode: code,
          daysInStage: 0,
          stageUpdatedAt: formatISO(new Date()),
          createdAt: formatISO(new Date()),
          stageHistory: [
            {
              stage: dealInput.stage,
              date: formatISO(new Date()),
              updatedBy: 'System / User',
              note: 'Deal created in system.',
            },
          ],
        };
        set((state) => ({ deals: [newDeal, ...state.deals] }));
        get().logActivity({
          userId: 'usr-1',
          userName: 'Imran Qureshi',
          userRole: 'Owner',
          action: 'Created Deal',
          record: `Created deal ${newDeal.dealCode} for ${newDeal.title}`,
          ipAddress: '39.40.112.54',
        });
        return newDeal;
      },

      updateDeal: (id, updates) => {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },

      moveDealStage: (dealId, targetStage, updatedBy, note) => {
        const deals = get().deals;
        const targetDeal = deals.find((d) => d.id === dealId);
        if (!targetDeal) return;

        const updatedHistory = [
          {
            stage: targetStage,
            date: formatISO(new Date()),
            updatedBy,
            note: note || `Stage moved to ${targetStage}`,
          },
          ...targetDeal.stageHistory,
        ];

        // If moved to Closed Won:
        // 1. Auto create / update commission entry in commissions
        // 2. Mark property as Sold
        let updatedCommissions = [...get().commissions];
        let updatedProperties = [...get().properties];

        if (targetStage === 'Closed Won') {
          // Check if commission already exists
          const existingComm = updatedCommissions.find((c) => c.dealId === dealId);
          if (!existingComm) {
            const users = get().users;
            const agent = users.find((u) => u.id === targetDeal.sellingAgentId);
            const newCommission: CommissionEntry = {
              id: `comm-${Date.now()}`,
              dealId: targetDeal.id,
              propertyTitle: targetDeal.title,
              dealValue: targetDeal.dealValue,
              totalAgencyCommission: targetDeal.commissionSplit.totalAgencyCommission,
              agentId: targetDeal.sellingAgentId,
              agentName: agent?.name || 'Agent',
              agentShare: targetDeal.commissionSplit.agentShareAmount,
              referralPartner: targetDeal.referralPartnerName,
              referralShare: targetDeal.commissionSplit.referralShareAmount,
              agencyNet: targetDeal.commissionSplit.agencyNetProfit,
              status: 'Received',
              receivedAmount: targetDeal.commissionSplit.totalAgencyCommission,
              balance: 0,
              agentPayoutStatus: 'Pending',
              agentPayoutAmount: 0,
              createdAt: formatISO(new Date()),
              lastPaymentDate: formatISO(new Date()),
            };
            updatedCommissions = [newCommission, ...updatedCommissions];
          }

          // Mark property as Sold
          updatedProperties = updatedProperties.map((p) =>
            p.id === targetDeal.propertyId ? { ...p, status: 'Sold' as const } : p
          );
        }

        set({
          deals: deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  stage: targetStage,
                  daysInStage: 0,
                  stageUpdatedAt: formatISO(new Date()),
                  stageHistory: updatedHistory,
                }
              : d
          ),
          commissions: updatedCommissions,
          properties: updatedProperties,
        });

        get().logActivity({
          userId: 'usr-1',
          userName: updatedBy,
          userRole: 'Owner',
          action: 'Moved Deal Stage',
          record: `Deal ${targetDeal.dealCode} transitioned to ${targetStage}`,
          ipAddress: '39.40.112.54',
        });
      },

      updateCommissionSplit: (
        dealId,
        buyerPercent,
        sellerPercent,
        agentSharePercent,
        referralSharePercent,
        updatedBy
      ) => {
        const deal = get().deals.find((d) => d.id === dealId);
        if (!deal) return;

        const calc = calculateCommission({
          dealValue: deal.dealValue,
          buyerCommissionPercent: buyerPercent,
          sellerCommissionPercent: sellerPercent,
          agentSharePercent,
          referralSharePercent,
        });

        const newSplit = {
          buyerCommissionPercent: buyerPercent,
          sellerCommissionPercent: sellerPercent,
          totalAgencyCommission: calc.totalAgencyCommission,
          agentSharePercent,
          agentShareAmount: calc.agentShareAmount,
          referralSharePercent,
          referralShareAmount: calc.referralShareAmount,
          agencyNetProfit: calc.agencyNetProfit,
          isLocked: true,
          lockedBy: updatedBy,
          lockedAt: formatISO(new Date()),
        };

        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId ? { ...d, commissionSplit: newSplit } : d
          ),
        }));

        get().logActivity({
          userId: 'usr-1',
          userName: updatedBy,
          userRole: 'Owner',
          action: 'Changed Commission Split',
          record: `Updated split on ${deal.dealCode} (${calc.totalAgencyCommission.toLocaleString()} PKR)`,
          ipAddress: '39.40.112.54',
        });
      },

      // Visits Actions
      addVisit: (visitInput) => {
        const newVisit: SiteVisit = {
          ...visitInput,
          id: `visit-${Date.now()}`,
          createdAt: formatISO(new Date()),
        };
        set((state) => ({ visits: [newVisit, ...state.visits] }));
        return newVisit;
      },

      updateVisit: (id, updates) => {
        set((state) => ({
          visits: state.visits.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        }));
      },

      completeVisit: (id, feedback, feedbackNotes, nextFollowUpDate) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id
              ? {
                  ...v,
                  status: 'Completed',
                  feedback,
                  feedbackNotes,
                  nextFollowUpDate,
                }
              : v
          ),
        }));
      },

      // Tasks Actions
      addTask: (taskInput) => {
        const newTask: Task = {
          ...taskInput,
          id: `task-${Date.now()}`,
          status: 'Pending',
          createdAt: formatISO(new Date()),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      completeTask: (id, outcomeNote) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'Completed',
                  outcomeNote,
                  completedAt: formatISO(new Date()),
                }
              : t
          ),
        }));
      },

      // Commissions & Expenses
      updateCommissionPayment: (id, receivedIncrement) => {
        set((state) => ({
          commissions: state.commissions.map((c) => {
            if (c.id !== id) return c;
            const newReceived = Math.min(c.totalAgencyCommission, c.receivedAmount + receivedIncrement);
            const balance = c.totalAgencyCommission - newReceived;
            const status: 'Pending' | 'Partially Received' | 'Received' =
              balance === 0 ? 'Received' : newReceived > 0 ? 'Partially Received' : 'Pending';
            return {
              ...c,
              receivedAmount: newReceived,
              balance,
              status,
              lastPaymentDate: formatISO(new Date()),
            };
          }),
        }));
      },

      recordAgentPayout: (id) => {
        set((state) => ({
          commissions: state.commissions.map((c) =>
            c.id === id
              ? {
                  ...c,
                  agentPayoutStatus: 'Paid',
                  agentPayoutAmount: c.agentShare,
                }
              : c
          ),
        }));
      },

      addExpense: (expenseInput) => {
        const newExp: Expense = {
          ...expenseInput,
          id: `exp-${Date.now()}`,
        };
        set((state) => ({ expenses: [newExp, ...state.expenses] }));
      },

      // WhatsApp Actions
      toggleWhatsAppRule: (ruleId) => {
        set((state) => ({
          whatsappRules: state.whatsappRules.map((r) =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
          ),
        }));
      },

      addWhatsAppLog: (recipientName, recipientPhone, templateName) => {
        const newLog: WhatsAppLog = {
          id: `wlog-${Date.now()}`,
          recipientName,
          recipientPhone,
          templateName,
          sentAt: formatISO(new Date()),
          status: 'Delivered',
        };
        set((state) => ({ whatsappLogs: [newLog, ...state.whatsappLogs] }));
      },

      // Agent Deactivation & Portfolio Reassignment
      deactivateAgentAndReassign: (agentId, reassignToAgentId, performedBy) => {
        const departingAgent = get().users.find((u) => u.id === agentId);
        const receivingAgent = get().users.find((u) => u.id === reassignToAgentId);

        // Count affected items
        const leadCount = get().leads.filter((l) => l.assignedAgentId === agentId).length;
        const dealCount = get().deals.filter(
          (d) => (d.sellingAgentId === agentId || d.listingAgentId === agentId) && d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'
        ).length;

        set((state) => ({
          users: state.users.map((u) => (u.id === agentId ? { ...u, active: false } : u)),
          leads: state.leads.map((l) =>
            l.assignedAgentId === agentId ? { ...l, assignedAgentId: reassignToAgentId } : l
          ),
          clients: state.clients.map((c) =>
            c.assignedAgentId === agentId ? { ...c, assignedAgentId: reassignToAgentId } : c
          ),
          deals: state.deals.map((d) => {
            const updates: Partial<Deal> = {};
            if (d.sellingAgentId === agentId) updates.sellingAgentId = reassignToAgentId;
            if (d.listingAgentId === agentId) updates.listingAgentId = reassignToAgentId;
            return Object.keys(updates).length > 0 ? { ...d, ...updates } : d;
          }),
          tasks: state.tasks.map((t) =>
            t.agentId === agentId && t.status === 'Pending' ? { ...t, agentId: reassignToAgentId } : t
          ),
        }));

        get().logActivity({
          userId: 'usr-1',
          userName: performedBy,
          userRole: 'Owner',
          action: 'Deactivated Agent & Reassigned Portfolio',
          record: `Deactivated ${departingAgent?.name || 'Agent'} and transferred ${leadCount} leads, ${dealCount} open deals to ${receivingAgent?.name || 'Agent'}`,
          ipAddress: '39.40.112.54',
        });
      },

      // Activity & Notifications
      logActivity: (entry) => {
        const newEntry: ActivityLogEntry = {
          ...entry,
          id: `act-${Date.now()}`,
          timestamp: formatISO(new Date()),
        };
        set((state) => ({ activityLogs: [newEntry, ...state.activityLogs] }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      // Settings
      updateAgencyProfile: (updates) => {
        set((state) => ({
          agencyProfile: { ...state.agencyProfile, ...updates },
        }));
      },

      resetDemoData: () => {
        set({
          users: INITIAL_USERS,
          leads: [],
          properties: [],
          clients: [],
          deals: [],
          visits: [],
          tasks: [],
          commissions: [],
          expenses: [],
          whatsappRules: INITIAL_WHATSAPP_RULES,
          whatsappTemplates: INITIAL_WHATSAPP_TEMPLATES,
          whatsappLogs: [],
          activityLogs: [],
          notifications: [],
          agencyProfile: DEFAULT_AGENCY_PROFILE,
        });
      },
    }),
    {
      name: 'propertyos-crm-live-production-v1',
    }
  )
);

