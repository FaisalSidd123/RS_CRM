import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Property, PropertyStatus, PropertyType, PropertyPurpose, AreaUnit } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceText } from '@/components/PriceText';
import { AreaText } from '@/components/AreaText';
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
import { checkPropertyDuplicate } from '@/lib/duplicates';
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  FileCheck,
  FileX,
  Bed,
  Bath,
  Calendar,
  Building,
  User,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const PropertiesPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { properties, addProperty, updateProperty, leads, visits, users } = useAppStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);

  // Filters
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Property Form State
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState<PropertyPurpose>('Sale');
  const [type, setType] = useState<PropertyType>('House');
  const [city, setCity] = useState<'Karachi' | 'Lahore' | 'Islamabad'>('Karachi');
  const [area, setArea] = useState('DHA Phase 6');
  const [blockPhase, setBlockPhase] = useState('Khayaban-e-Seher');
  const [size, setSize] = useState<number>(500);
  const [sizeUnit, setSizeUnit] = useState<AreaUnit>('sq yd');
  const [price, setPrice] = useState<number>(120000000);
  const [bedrooms, setBedrooms] = useState<number>(5);
  const [bathrooms, setBathrooms] = useState<number>(6);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [listingAgentId, setListingAgentId] = useState('usr-3');

  const agentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  // DUPLICATE PROPERTY CHECK
  const duplicatePropMatch = useMemo(() => {
    if (!area || !size) return null;
    return checkPropertyDuplicate({ area, blockPhase, size, sizeUnit, ownerPhone }, properties);
  }, [area, blockPhase, size, sizeUnit, ownerPhone, properties]);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (filterCity !== 'all' && p.city !== filterCity) return false;
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterPurpose !== 'all' && p.purpose !== filterPurpose) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = p.propertyCode.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesArea = p.area.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesArea) return false;
      }
      return true;
    });
  }, [properties, filterCity, filterType, filterPurpose, filterStatus, searchQuery]);

  // Interested leads for selected property
  const interestedLeads = useMemo(() => {
    if (!selectedProperty) return [];
    return leads.filter((l) => {
      const matchType = l.propertyType === selectedProperty.type;
      const matchLoc = l.preferredLocations.some((loc) => selectedProperty.area.includes(loc));
      return matchType && matchLoc;
    }).slice(0, 5);
  }, [selectedProperty, leads]);

  // Visits for selected property
  const propertyVisits = useMemo(() => {
    if (!selectedProperty) return [];
    return visits.filter((v) => v.propertyId === selectedProperty.id);
  }, [selectedProperty, visits]);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ownerName || !ownerPhone) {
      toast.error('Please enter title, owner name and phone.');
      return;
    }

    const created = addProperty({
      title,
      purpose,
      type,
      city,
      area,
      blockPhase,
      size: Number(size),
      sizeUnit,
      price: Number(price),
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      ownerName,
      ownerPhone,
      status: 'Available',
      listingAgentId,
      agencyCommissionPercent: purpose === 'Rent' ? 100 : 1.0,
      documents: [
        { name: 'Allotment Letter', status: 'uploaded' },
        { name: 'Transfer Letter', status: 'uploaded' },
        { name: 'Society NOC', status: 'uploaded' },
        { name: 'Approved Building Plan', status: 'missing' },
      ],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      ],
      isPossibleDuplicate: !!duplicatePropMatch,
      description: `Newly listed ${size} ${sizeUnit} ${type} in ${area}, ${blockPhase}. Clear title papers.`,
    });

    toast.success(`Property listing ${created.propertyCode} created successfully.`);
    setAddPropertyOpen(false);
    // Reset
    setTitle('');
    setOwnerName('');
    setOwnerPhone('');
  };

  const columns: Column<Property>[] = [
    {
      key: 'propertyCode',
      header: 'Code & Title',
      sortable: true,
      render: (prop) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span>{prop.propertyCode}</span>
            {prop.isPossibleDuplicate && (
              <span className="text-[10px] font-bold px-1.5 rounded bg-amber-100 text-amber-800">DUP</span>
            )}
            {prop.isStale && (
              <span className="text-[10px] font-bold px-1.5 rounded bg-red-100 text-red-800">STALE</span>
            )}
          </div>
          <p className="text-xs text-slate-600 line-clamp-1 max-w-[200px]">{prop.title}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (prop) => <StatusBadge status={prop.status} dot />,
    },
    {
      key: 'purpose',
      header: 'For',
      sortable: true,
      render: (prop) => (
        <span className="text-xs font-semibold text-slate-800">{prop.purpose}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (prop) => <span className="text-xs text-slate-600">{prop.type}</span>,
    },
    {
      key: 'location',
      header: 'Location / Area',
      render: (prop) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">{prop.area}</span>
          <span className="block text-[11px] text-slate-400">{prop.blockPhase}</span>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      render: (prop) => <AreaText value={prop.size} unit={prop.sizeUnit} />,
    },
    {
      key: 'price',
      header: 'Price / Demand',
      sortable: true,
      render: (prop) => <PriceText amount={prop.price} />,
    },
    {
      key: 'owner',
      header: 'Owner Contact',
      render: (prop) => (
        <div className="text-xs space-y-0.5">
          <span className="text-slate-800 font-medium block truncate max-w-[100px]">{prop.ownerName}</span>
          <MaskedPhone phone={prop.ownerPhone} isOwnerPhone propertyCode={prop.propertyCode} />
        </div>
      ),
    },
    {
      key: 'agent',
      header: 'Listing Agent',
      render: (prop) => {
        const agentName = agentsMap[prop.listingAgentId] || 'Agent';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <AgentAvatar name={agentName} size="sm" />
            <span className="text-slate-700 font-medium">{agentName}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Property Inventory"
        description="Exclusive listings across DHA, Clifton, Bahria Town and Islamabad. Integrated legal documentation checklist."
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="inline-flex rounded-[8px] bg-white p-1 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'grid' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'table' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>

            {can(currentUser?.role, 'create_property') && (
              <Button onClick={() => setAddPropertyOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                List Property
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Filter:</span>

          {/* City */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Cities</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Plot">Plot</option>
            <option value="Commercial Shop">Commercial</option>
            <option value="Office">Office</option>
          </select>

          {/* Purpose */}
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">Sale & Rent</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Under Offer">Under Offer</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search code, title, DHA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => (
            <Card
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className="overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image & Status Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <StatusBadge status={prop.status} />
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-xs">
                      {prop.purpose}
                    </span>
                  </div>

                  {/* Duplicate / Stale Warnings */}
                  <div className="absolute bottom-2 left-2.5 flex flex-wrap gap-1">
                    {prop.isPossibleDuplicate && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        Possible Duplicate
                      </span>
                    )}
                    {prop.isStale && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                        Stale Listing (&gt;60d)
                      </span>
                    )}
                    {prop.isSoldStillListed && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-700 text-white shadow-xs">
                        Sold — Still Listed Warning
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{prop.propertyCode}</span>
                    <span>{prop.city}</span>
                  </div>

                  <h3 className="font-heading font-semibold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {prop.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-600 font-medium">{prop.area}, {prop.blockPhase}</span>
                    <AreaText value={prop.size} unit={prop.sizeUnit} />
                  </div>

                  {/* Bed / Bath if House or Apartment */}
                  {(prop.bedrooms || prop.bathrooms) && (
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      {prop.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-slate-400" />
                          <span>{prop.bedrooms} Beds</span>
                        </div>
                      )}
                      {prop.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-slate-400" />
                          <span>{prop.bathrooms} Baths</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Price & Owner Masked Contact */}
              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Demand</span>
                  <div>
                    <PriceText amount={prop.price} className="text-base" />
                  </div>
                </div>

                <div className="text-right">
                  <MaskedPhone phone={prop.ownerPhone} isOwnerPhone propertyCode={prop.propertyCode} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredProperties}
          columns={columns}
          searchPlaceholder="Search properties..."
          onRowClick={(p) => setSelectedProperty(p)}
        />
      )}

      {/* ============================================================== */}
      {/* ADD PROPERTY LISTING DIALOG */}
      {/* ============================================================== */}
      <Dialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>List New Agency Property</DialogTitle>
            <DialogDescription>
              Add exclusive direct owner listing. Duplicate detection checks society, block, and owner number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-4">
            {/* DUPLICATE WARNING */}
            {duplicatePropMatch && (
              <div className="rounded-[8px] bg-amber-50 border border-amber-200 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Possible Duplicate Listing Detected!
                </div>
                <p className="text-amber-800">
                  Another property (<strong>{duplicatePropMatch.propertyCode}</strong>) exists in{' '}
                  {duplicatePropMatch.area} with matching size and contact. Please verify ownership.
                </p>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Listing Headline / Title *</label>
              <Input
                required
                placeholder="e.g. Brand New 500 Sq Yd Designer Bungalow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as PropertyPurpose)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial Shop">Shop</option>
                  <option value="Office">Office</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Society / Area</label>
                <Input
                  required
                  placeholder="DHA Phase 6"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Phase / Block / Street</label>
                <Input
                  placeholder="Khayaban-e-Seher"
                  value={blockPhase}
                  onChange={(e) => setBlockPhase(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Unit Type</label>
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as AreaUnit)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="sq yd">sq yd</option>
                  <option value="sq ft">sq ft</option>
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Size Value</label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-slate-700">Price / Demand (PKR)</label>
                <Input
                  type="number"
                  step="5000000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
                <span className="text-[10px] text-slate-400">{formatPKR(price)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Owner Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Tariq Mansoor"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Owner Phone (Masked for Agents) *</label>
                <Input
                  required
                  placeholder="0300-1234567"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddPropertyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & List Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* PROPERTY DETAIL SHEET (IMAGE GALLERY, DOCS, VISITS, LEADS) */}
      {/* ============================================================== */}
      <Sheet open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        {selectedProperty && (
          <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <div className="text-xs font-mono text-emerald-700 font-bold">{selectedProperty.propertyCode}</div>
                  <SheetTitle className="text-lg">{selectedProperty.title}</SheetTitle>
                  <SheetDescription>
                    {selectedProperty.area}, {selectedProperty.blockPhase}, {selectedProperty.city}
                  </SheetDescription>
                </div>
                <StatusBadge status={selectedProperty.status} />
              </div>
            </SheetHeader>

            {/* Photo Gallery Carousel Preview */}
            <div className="space-y-2">
              <div className="h-64 w-full rounded-[10px] overflow-hidden bg-slate-100">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {selectedProperty.images.map((img, i) => (
                  <div key={i} className="h-16 w-24 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={img} alt="thumb" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Legal Owner Contact Card */}
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Asking Demand</span>
                <PriceText amount={selectedProperty.price} className="text-xl font-bold" />
                <span className="text-[11px] text-slate-500 block pt-0.5">
                  Agency Commission: {selectedProperty.agencyCommissionPercent}% from each side
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5 min-w-[200px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Owner Contact</span>
                <div className="font-semibold text-slate-900">{selectedProperty.ownerName}</div>
                <MaskedPhone
                  phone={selectedProperty.ownerPhone}
                  isOwnerPhone
                  propertyCode={selectedProperty.propertyCode}
                />
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Size</span>
                <p className="font-semibold text-slate-900">{selectedProperty.size} {selectedProperty.sizeUnit}</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Type</span>
                <p className="font-semibold text-slate-900">{selectedProperty.type}</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Bed / Bath</span>
                <p className="font-semibold text-slate-900">
                  {selectedProperty.bedrooms ? `${selectedProperty.bedrooms} Bed` : '-'} /{' '}
                  {selectedProperty.bathrooms ? `${selectedProperty.bathrooms} Bath` : '-'}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Listing Agent</span>
                <p className="font-semibold text-slate-900">{agentsMap[selectedProperty.listingAgentId] || 'Agent'}</p>
              </div>
            </div>

            {/* Documents Legal Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-700" />
                Legal Title & Transfer Documents Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedProperty.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <span className="font-medium text-slate-800">{doc.name}</span>
                    {doc.status === 'uploaded' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Vetted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="h-3 w-3" /> Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interested Leads Matching this property */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Buyers Matching this Property ({interestedLeads.length})
              </h4>
              <div className="space-y-2 text-xs">
                {interestedLeads.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        <MaskedPhone phone={l.phone} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-emerald-700">{formatPKR(l.budgetMax)} max</div>
                      <StatusBadge status={l.temperature} />
                    </div>
                  </div>
                ))}
                {interestedLeads.length === 0 && (
                  <p className="text-slate-400 text-xs italic">No matching leads in active pipeline</p>
                )}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

