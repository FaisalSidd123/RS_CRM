import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Client, ClientType, ClientTag, PropertyType, Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { MaskedPhone } from '@/components/MaskedPhone';
import { AgentAvatar } from '@/components/AgentAvatar';
import { DataTable, Column } from '@/components/DataTable';
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
import {
  Plus,
  Building,
  Briefcase,
  Calendar,
  CheckCircle2,
  Mail,
  User,
  Globe,
  Tag,
  Sparkles,
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { clients, addClient, updateClient, properties, deals, visits, users } = useAppStore();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Client Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('42201-XXXXXXX-5');
  const [city, setCity] = useState('Karachi');
  const [types, setTypes] = useState<ClientType[]>(['Buyer']);
  const [budgetMin, setBudgetMin] = useState<number>(30000000);
  const [budgetMax, setBudgetMax] = useState<number>(70000000);
  const [preferredLocation, setPreferredLocation] = useState('DHA Phase 6');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [tags, setTags] = useState<ClientTag[]>([]);
  const [notes, setNotes] = useState('');

  const agentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  // Role filtering: Agents see own clients or all clients based on permissions
  const visibleClients = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return clients.filter((c) => c.assignedAgentId === currentUser.id);
    }
    return clients;
  }, [clients, currentUser]);

  // Filtered List
  const filteredClients = useMemo(() => {
    return visibleClients.filter((client) => {
      if (filterType !== 'all' && !client.types.includes(filterType as ClientType)) return false;
      if (filterTag !== 'all' && !client.tags.includes(filterTag as ClientTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = client.name.toLowerCase().includes(q);
        const matchesPhone = client.phone.includes(q);
        const matchesCity = client.city.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCity) return false;
      }
      return true;
    });
  }, [visibleClients, filterType, filterTag, searchQuery]);

  // AI Matching Properties with Match Score %
  const clientMatchingProperties = useMemo(() => {
    if (!selectedClient) return [];
    return properties
      .filter((p) => p.status === 'Available')
      .map((prop) => {
        let score = 50; // base score
        // Budget check
        if (prop.price >= selectedClient.budgetMin && prop.price <= selectedClient.budgetMax) {
          score += 25;
        } else if (prop.price >= selectedClient.budgetMin * 0.8 && prop.price <= selectedClient.budgetMax * 1.2) {
          score += 15;
        }

        // Location check
        if (selectedClient.preferredLocations.some((loc) => prop.area.toLowerCase().includes(loc.toLowerCase()))) {
          score += 20;
        }

        // Type check
        if (selectedClient.preferredPropertyType.includes(prop.type)) {
          score += 15;
        }

        return {
          property: prop,
          matchScore: Math.min(98, score),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [selectedClient, properties]);

  // Linked Deals & Visits
  const clientDeals = useMemo(() => {
    if (!selectedClient) return [];
    return deals.filter((d) => d.buyerClientId === selectedClient.id || d.sellerClientId === selectedClient.id);
  }, [selectedClient, deals]);

  const clientVisits = useMemo(() => {
    if (!selectedClient) return [];
    return visits.filter((v) => v.clientId === selectedClient.id);
  }, [selectedClient, visits]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Please enter client full name and contact number.');
      return;
    }

    const created = addClient({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      cnic,
      city,
      types,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      preferredLocations: [preferredLocation],
      preferredPropertyType: [propertyType],
      assignedAgentId: currentUser?.id || 'usr-3',
      tags,
      notes,
    });

    toast.success(`Client profile for ${created.name} added.`);
    setAddClientOpen(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client Name',
      sortable: true,
      render: (client) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span>{client.name}</span>
            {client.tags.includes('VIP') && (
              <span className="text-[10px] font-bold px-1.5 rounded bg-amber-100 text-amber-800">VIP</span>
            )}
            {client.tags.includes('Overseas Pakistani') && (
              <span className="text-[10px] font-bold px-1.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <Globe className="h-2.5 w-2.5" /> RDA
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            <MaskedPhone phone={client.phone} />
          </div>
        </div>
      ),
    },
    {
      key: 'types',
      header: 'Client Roles',
      render: (client) => (
        <div className="flex flex-wrap gap-1">
          {client.types.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'city',
      header: 'City',
      sortable: true,
      render: (client) => <span className="text-xs text-slate-700">{client.city}</span>,
    },
    {
      key: 'budget',
      header: 'Budget Range',
      render: (client) => (
        <div className="text-xs font-medium text-emerald-700">
          {formatPKR(client.budgetMin)} - {formatPKR(client.budgetMax)}
        </div>
      ),
    },
    {
      key: 'locations',
      header: 'Preferred Locations',
      render: (client) => (
        <span className="text-xs text-slate-600 truncate max-w-[140px] inline-block">
          {client.preferredLocations.join(', ')}
        </span>
      ),
    },
    {
      key: 'cnic',
      header: 'CNIC (Masked)',
      render: (client) => <span className="text-xs text-slate-400 font-mono">{client.cnic}</span>,
    },
    {
      key: 'agent',
      header: 'Assigned Agent',
      render: (client) => {
        const agentName = agentsMap[client.assignedAgentId] || 'Agent';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <AgentAvatar name={agentName} size="sm" />
            <span className="text-slate-800 font-medium">{agentName}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Client Directory"
        description="Verified buyer and investor relationships. Includes Overseas Pakistanis with Roshan Digital Accounts."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddClientOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Filter:</span>

          {/* Client Role */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Client Types</option>
            <option value="Buyer">Buyers</option>
            <option value="Seller">Sellers</option>
            <option value="Investor">Investors</option>
            <option value="Landlord">Landlords</option>
            <option value="Tenant">Tenants</option>
          </select>

          {/* Tags */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Tags</option>
            <option value="Overseas Pakistani">Overseas Pakistani</option>
            <option value="VIP">VIP Client</option>
            <option value="Repeat client">Repeat Client</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search name, phone, Karachi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Clients Table */}
      <DataTable
        data={filteredClients}
        columns={columns}
        searchPlaceholder="Search clients..."
        onRowClick={(c) => setSelectedClient(c)}
      />

      {/* ============================================================== */}
      {/* ADD CLIENT DIALOG */}
      {/* ============================================================== */}
      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Client Profile</DialogTitle>
            <DialogDescription>
              Record party requirements and tag Overseas or VIP status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Client Name *</label>
                <Input
                  required
                  placeholder="e.g. Shahid Hashmi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Phone Number *</label>
                <Input
                  required
                  placeholder="0321-4455667"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="shahid@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">City / Location Base</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Min Budget (PKR)</label>
                <Input
                  type="number"
                  step="5000000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Max Budget (PKR)</label>
                <Input
                  type="number"
                  step="5000000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Preferred Society</label>
                <Input
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Tags</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value as ClientTag;
                    if (val && !tags.includes(val)) setTags([...tags, val]);
                  }}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="">Select Tag...</option>
                  <option value="Overseas Pakistani">Overseas Pakistani</option>
                  <option value="VIP">VIP Client</option>
                  <option value="Repeat client">Repeat Client</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Client Profile Notes</label>
              <Input
                placeholder="RDA bank verification status, family size, immediate or investment timeline..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Client Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* CLIENT DETAIL SHEET (MATCHING PROPERTIES + DEALS + VISITS) */}
      {/* ============================================================== */}
      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        {selectedClient && (
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <SheetTitle className="text-xl flex items-center gap-2">
                    {selectedClient.name}
                  </SheetTitle>
                  <SheetDescription>
                    Client based in {selectedClient.city} • Registered {formatDate(selectedClient.createdAt)}
                  </SheetDescription>
                </div>
                <div className="flex gap-1">
                  {selectedClient.types.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </SheetHeader>

            {/* Profile Overview Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                <MaskedPhone phone={selectedClient.phone} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">CNIC (Protected)</span>
                <span className="font-mono text-slate-700">{selectedClient.cnic}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Cap</span>
                <span className="font-bold text-emerald-700">{formatPKR(selectedClient.budgetMax)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Advisor</span>
                <span className="font-medium text-slate-800">{agentsMap[selectedClient.assignedAgentId] || 'Agent'}</span>
              </div>
            </div>

            {/* AI Property Matching Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  AI Matching Inventory ({clientMatchingProperties.length})
                </h4>
                <span className="text-[11px] text-slate-500">Based on budget, area & unit preference</span>
              </div>

              <div className="space-y-2">
                {clientMatchingProperties.map(({ property, matchScore }) => (
                  <div
                    key={property.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{property.propertyCode}</span>
                        <span className="text-slate-600 truncate max-w-[220px]">{property.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {property.area} • {property.size} {property.sizeUnit}
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <PriceText amount={property.price} />
                      <div className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {matchScore}% Match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Deals History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-emerald-700" />
                Linked Deal History ({clientDeals.length})
              </h4>
              {clientDeals.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{d.dealCode}: {d.title}</div>
                    <div className="text-[11px] text-slate-500">Value: {formatPKR(d.dealValue)}</div>
                  </div>
                  <StatusBadge status={d.stage} />
                </div>
              ))}
              {clientDeals.length === 0 && (
                <p className="text-xs text-slate-400 italic">No deals closed or active with this party yet</p>
              )}
            </div>

            {/* Linked Site Visits */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-700" />
                Site Visits Log ({clientVisits.length})
              </h4>
              {clientVisits.map((v) => (
                <div key={v.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{formatDate(v.date)} at {v.time}</div>
                    <div className="text-[11px] text-slate-500">{v.feedbackNotes || 'No notes logged'}</div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

