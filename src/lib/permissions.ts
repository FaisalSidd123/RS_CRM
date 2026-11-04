import { UserRole } from '@/types';

export type PermissionAction =
  | 'view_all_leads'
  | 'view_own_leads'
  | 'create_lead'
  | 'edit_lead'
  | 'delete_lead'
  | 'reassign_lead'
  | 'export_leads'
  | 'view_properties'
  | 'create_property'
  | 'edit_property'
  | 'view_property_owner_phone'
  | 'view_all_clients'
  | 'view_own_clients'
  | 'create_client'
  | 'export_clients'
  | 'view_all_deals'
  | 'view_own_deals'
  | 'create_deal'
  | 'edit_deal'
  | 'edit_locked_commission'
  | 'view_all_visits'
  | 'view_own_visits'
  | 'create_visit'
  | 'view_all_tasks'
  | 'view_own_tasks'
  | 'create_task'
  | 'view_agents_page'
  | 'manage_agents'
  | 'view_agency_commissions'
  | 'view_agency_financials'
  | 'manage_expenses'
  | 'view_whatsapp'
  | 'view_activity_log'
  | 'view_settings'
  | 'manage_settings'
  | 'reset_demo_data';

export const PERMISSIONS_MATRIX: Record<PermissionAction, { label: string; roles: UserRole[] }> = {
  view_all_leads: { label: 'View all agency leads', roles: ['Owner', 'Manager'] },
  view_own_leads: { label: 'View own leads', roles: ['Owner', 'Manager', 'Agent'] },
  create_lead: { label: 'Create new lead', roles: ['Owner', 'Manager', 'Agent'] },
  edit_lead: { label: 'Edit lead details', roles: ['Owner', 'Manager', 'Agent'] },
  delete_lead: { label: 'Delete lead', roles: ['Owner'] },
  reassign_lead: { label: 'Reassign leads across agents', roles: ['Owner', 'Manager'] },
  export_leads: { label: 'Export leads to CSV/Excel', roles: ['Owner'] },
  view_properties: { label: 'View property inventory', roles: ['Owner', 'Manager', 'Agent'] },
  create_property: { label: 'List new property', roles: ['Owner', 'Manager'] },
  edit_property: { label: 'Edit property listings', roles: ['Owner', 'Manager'] },
  view_property_owner_phone: { label: 'View unmasked owner contact', roles: ['Owner', 'Manager'] },
  view_all_clients: { label: 'View all client records', roles: ['Owner', 'Manager'] },
  view_own_clients: { label: 'View own assigned clients', roles: ['Owner', 'Manager', 'Agent'] },
  create_client: { label: 'Create client profile', roles: ['Owner', 'Manager', 'Agent'] },
  export_clients: { label: 'Export clients to CSV/Excel', roles: ['Owner'] },
  view_all_deals: { label: 'View all agency deals', roles: ['Owner', 'Manager'] },
  view_own_deals: { label: 'View own deals', roles: ['Owner', 'Manager', 'Agent'] },
  create_deal: { label: 'Create deal / Bayana token', roles: ['Owner', 'Manager', 'Agent'] },
  edit_deal: { label: 'Move deals across pipeline', roles: ['Owner', 'Manager', 'Agent'] },
  edit_locked_commission: { label: 'Unlock & edit commission splits', roles: ['Owner'] },
  view_all_visits: { label: 'View all agent site visits', roles: ['Owner', 'Manager'] },
  view_own_visits: { label: 'View own site visits', roles: ['Owner', 'Manager', 'Agent'] },
  create_visit: { label: 'Schedule site visit', roles: ['Owner', 'Manager', 'Agent'] },
  view_all_tasks: { label: 'View all agents tasks', roles: ['Owner', 'Manager'] },
  view_own_tasks: { label: 'View own tasks & follow-ups', roles: ['Owner', 'Manager', 'Agent'] },
  create_task: { label: 'Create task/follow-up', roles: ['Owner', 'Manager', 'Agent'] },
  view_agents_page: { label: 'Access Agents directory & targets', roles: ['Owner', 'Manager'] },
  manage_agents: { label: 'Deactivate & reassign agent portfolios', roles: ['Owner'] },
  view_agency_commissions: { label: 'View full agency commission ledger', roles: ['Owner'] },
  view_agency_financials: { label: 'View agency P&L, Revenue & Net Profit', roles: ['Owner'] },
  manage_expenses: { label: 'Record & view operational expenses', roles: ['Owner'] },
  view_whatsapp: { label: 'Access WhatsApp automation & templates', roles: ['Owner', 'Manager'] },
  view_activity_log: { label: 'Inspect security & activity audit log', roles: ['Owner'] },
  view_settings: { label: 'Access agency settings', roles: ['Owner', 'Manager'] },
  manage_settings: { label: 'Modify agency profile & subscription', roles: ['Owner'] },
  reset_demo_data: { label: 'Reset demo state to default seed', roles: ['Owner', 'Manager'] },
};

export function can(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  const permission = PERMISSIONS_MATRIX[action];
  if (!permission) return false;
  return permission.roles.includes(role);
}

