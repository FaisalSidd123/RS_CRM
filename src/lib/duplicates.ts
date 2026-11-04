import { Lead, Client, Property } from '@/types';
import { formatDate } from './format';

export interface LeadDuplicateMatch {
  found: boolean;
  type: 'lead' | 'client';
  id: string;
  name: string;
  assignedAgentName: string;
  sourceOrType: string;
  dateStr: string;
}

export function checkLeadPhoneDuplicate(
  phone: string,
  leads: Lead[],
  clients: Client[],
  agentsMap: Record<string, string>,
  excludeId?: string
): LeadDuplicateMatch | null {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 8) return null;

  // Check leads
  const existingLead = leads.find((l) => {
    if (excludeId && l.id === excludeId) return false;
    const lPhone = l.phone.replace(/\D/g, '');
    return lPhone.endsWith(cleanPhone.slice(-7)) || cleanPhone.endsWith(lPhone.slice(-7));
  });

  if (existingLead) {
    return {
      found: true,
      type: 'lead',
      id: existingLead.id,
      name: existingLead.name,
      assignedAgentName: existingLead.assignedAgentId ? (agentsMap[existingLead.assignedAgentId] || 'Agent') : 'Unassigned',
      sourceOrType: existingLead.source,
      dateStr: formatDate(existingLead.createdAt),
    };
  }

  // Check clients
  const existingClient = clients.find((c) => {
    const cPhone = c.phone.replace(/\D/g, '');
    return cPhone.endsWith(cleanPhone.slice(-7)) || cleanPhone.endsWith(cPhone.slice(-7));
  });

  if (existingClient) {
    return {
      found: true,
      type: 'client',
      id: existingClient.id,
      name: existingClient.name,
      assignedAgentName: agentsMap[existingClient.assignedAgentId] || 'Agent',
      sourceOrType: existingClient.types.join(', '),
      dateStr: formatDate(existingClient.createdAt),
    };
  }

  return null;
}

export function checkPropertyDuplicate(
  property: Partial<Property>,
  existingProperties: Property[]
): Property | null {
  if (!property.area || !property.size) return null;
  
  return existingProperties.find((p) => {
    if (property.id && p.id === property.id) return false;
    const sameArea = p.area.toLowerCase().trim() === property.area?.toLowerCase().trim();
    const sameBlock = (p.blockPhase || '').toLowerCase().trim() === (property.blockPhase || '').toLowerCase().trim();
    const sameSize = Math.abs(p.size - (property.size || 0)) < 1;
    const sameUnit = p.sizeUnit === property.sizeUnit;
    
    // Check owner phone if present
    const cleanP1 = (property.ownerPhone || '').replace(/\D/g, '');
    const cleanP2 = (p.ownerPhone || '').replace(/\D/g, '');
    const samePhone = cleanP1 && cleanP2 && cleanP1.endsWith(cleanP2.slice(-7));

    return (sameArea && sameSize && sameUnit && sameBlock) || (sameArea && sameSize && samePhone);
  }) || null;
}

