import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { SiteVisit, VisitStatus, VisitFeedback } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
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
import { toast } from '@/components/ui/toast';
import { formatDate, formatTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Clock,
  Car,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  User,
  MessageSquare,
} from 'lucide-react';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';

export const VisitsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { visits, addVisit, updateVisit, completeVisit, properties, clients, users } = useAppStore();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedVisitForFeedback, setSelectedVisitForFeedback] = useState<SiteVisit | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');

  // New Visit Form
  const [selectedClientId, setSelectedClientId] = useState('client-1');
  const [selectedPropId, setSelectedPropId] = useState('prop-1');
  const [selectedAgentId, setSelectedAgentId] = useState('usr-3');
  const [visitDate, setVisitDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [visitTime, setVisitTime] = useState('16:00');
  const [pickupRequired, setPickupRequired] = useState(false);
  const [notes, setNotes] = useState('');

  // Feedback form
  const [feedback, setFeedback] = useState<VisitFeedback>('Interested');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => format(addDays(new Date(), 2), 'yyyy-MM-dd'));

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

  const propsMap = useMemo(() => {
    const map: Record<string, string> = {};
    properties.forEach((p) => { map[p.id] = `${p.propertyCode} - ${p.title}`; });
    return map;
  }, [properties]);

  // Conflict Warning: checks if selectedAgent has a visit within 1 hour on that day
  const hasScheduleConflict = useMemo(() => {
    if (!visitDate || !visitTime || !selectedAgentId) return false;
    const [h, m] = visitTime.split(':').map(Number);
    const targetMinutes = h * 60 + m;

    return visits.some((v) => {
      if (v.agentId !== selectedAgentId || v.status === 'Cancelled') return false;
      if (v.date.slice(0, 10) !== visitDate) return false;
      const [vh, vm] = v.time.split(':').map(Number);
      const vMinutes = vh * 60 + vm;
      return Math.abs(targetMinutes - vMinutes) < 60; // within 1 hour
    });
  }, [visitDate, visitTime, selectedAgentId, visits]);

  // Role filtering
  const visibleVisits = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return visits.filter((v) => v.agentId === currentUser.id);
    }
    return visits;
  }, [visits, currentUser]);

  const filteredVisits = useMemo(() => {
    return visibleVisits.filter((v) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (filterAgent !== 'all' && v.agentId !== filterAgent) return false;
      return true;
    });
  }, [visibleVisits, filterStatus, filterAgent]);

  // Calendar Week Generator
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisit({
      clientId: selectedClientId,
      propertyId: selectedPropId,
      agentId: selectedAgentId,
      date: new Date(visitDate).toISOString(),
      time: visitTime,
      status: 'Scheduled',
      pickupRequired,
      feedbackNotes: notes,
    });
    toast.success('Site visit scheduled successfully. Reminder queued for WhatsApp.');
    setScheduleModalOpen(false);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitForFeedback) return;
    completeVisit(selectedVisitForFeedback.id, feedback, feedbackNotes, nextFollowUpDate);
    toast.success('Visit feedback recorded and client timeline updated.');
    setFeedbackModalOpen(false);
    setSelectedVisitForFeedback(null);
  };

  const columns: Column<SiteVisit>[] = [
    {
      key: 'client',
      header: 'Client',
      render: (v) => (
        <span className="font-semibold text-xs text-slate-900">{clientsMap[v.clientId] || 'Client'}</span>
      ),
    },
    {
      key: 'property',
      header: 'Property',
      render: (v) => (
        <span className="text-xs text-slate-700 truncate max-w-[200px] block">
          {propsMap[v.propertyId] || 'Property'}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Date & Time',
      sortable: true,
      render: (v) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900">{formatDate(v.date)}</span>
          <span className="text-emerald-700 block font-semibold">{formatTime(v.time)}</span>
        </div>
      ),
    },
    {
      key: 'agent',
      header: 'Field Advisor',
      render: (v) => {
        const agentName = agentsMap[v.agentId] || 'Agent';
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <AgentAvatar name={agentName} size="sm" />
            <span className="text-slate-800 font-medium">{agentName}</span>
          </div>
        );
      },
    },
    {
      key: 'pickupRequired',
      header: 'Vehicle Pickup',
      render: (v) => (
        v.pickupRequired ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Car className="h-3 w-3" /> Pickup
          </span>
        ) : (
          <span className="text-xs text-slate-400">Direct</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => <StatusBadge status={v.status} dot />,
    },
    {
      key: 'feedback',
      header: 'Client Feedback',
      render: (v) => {
        if (v.feedback) {
          return (
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-slate-800">{v.feedback}</span>
              <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{v.feedbackNotes}</p>
            </div>
          );
        }
        if (v.status === 'Scheduled') {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedVisitForFeedback(v);
                setFeedbackModalOpen(true);
              }}
              className="h-7 text-xs bg-slate-50 hover:bg-emerald-50 text-emerald-800 border-dashed"
            >
              Add Feedback
            </Button>
          );
        }
        return <span className="text-xs text-slate-400">-</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Site Visits & Property Tours"
        description="Schedule on-ground property viewings, coordinate driver pickup, and record buyer feedback."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-[8px] bg-white p-1 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'calendar' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="Calendar Week View"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[6px] transition-colors ${
                  viewMode === 'list' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => setScheduleModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Schedule Visit
            </Button>
          </div>
        }
      />

      {/* Calendar Week View */}
      {viewMode === 'calendar' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isCurrentToday = isSameDay(day, today);
              const dayVisits = filteredVisits.filter((v) => v.date.slice(0, 10) === dayStr);

              return (
                <div
                  key={idx}
                  className={`rounded-[10px] border p-3 flex flex-col justify-between min-h-[360px] transition-all ${
                    isCurrentToday ? 'border-emerald-500 bg-emerald-50/20 shadow-xs' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          {format(day, 'EEE')}
                        </span>
                        <div className={`text-base font-bold ${isCurrentToday ? 'text-emerald-800' : 'text-slate-900'}`}>
                          {format(day, 'dd MMM')}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {dayVisits.length}
                      </span>
                    </div>

                    {/* Day Visits List */}
                    <div className="space-y-2">
                      {dayVisits.map((v) => (
                        <div
                          key={v.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1.5 text-xs hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{formatTime(v.time)}</span>
                            <StatusBadge status={v.status} />
                          </div>

                          <div className="font-medium text-slate-800 truncate">
                            {clientsMap[v.clientId] || 'Client'}
                          </div>

                          <p className="text-[11px] text-slate-500 truncate">
                            {propsMap[v.propertyId] || 'Property'}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                            <span>{agentsMap[v.agentId]?.split(' ')[0]}</span>
                            {v.pickupRequired && (
                              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                                <Car className="h-2.5 w-2.5" /> Pickup
                              </span>
                            )}
                          </div>

                          {v.status === 'Scheduled' && (
                            <button
                              onClick={() => {
                                setSelectedVisitForFeedback(v);
                                setFeedbackModalOpen(true);
                              }}
                              className="w-full text-center py-1 mt-1 rounded bg-slate-50 hover:bg-emerald-50 text-[10px] text-emerald-800 font-semibold transition-colors"
                            >
                              Add Feedback
                            </button>
                          )}
                        </div>
                      ))}

                      {dayVisits.length === 0 && (
                        <div className="text-center py-8 text-[11px] text-slate-400 italic">
                          No visits
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setVisitDate(dayStr);
                      setScheduleModalOpen(true);
                    }}
                    className="w-full text-[11px] text-slate-400 hover:text-emerald-700 h-7"
                  >
                    + Add visit
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DataTable
          data={filteredVisits}
          columns={columns}
          searchPlaceholder="Search visits..."
        />
      )}

      {/* ============================================================== */}
      {/* SCHEDULE VISIT DIALOG WITH CONFLICT WARNING */}
      {/* ============================================================== */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Field Site Visit</DialogTitle>
            <DialogDescription>
              Assign client, property, and field advisor. Real-time calendar conflict check is active.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleVisit} className="space-y-4">
            {/* CONFLICT WARNING CALLOUT */}
            {hasScheduleConflict && (
              <div className="rounded-[8px] bg-amber-50 border border-amber-300 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Agent Schedule Conflict Warning!
                </div>
                <p className="text-amber-800">
                  {agentsMap[selectedAgentId] || 'Selected advisor'} already has another site visit scheduled within 1
                  hour of this time on {visitDate}. Please verify travel feasibility across Karachi traffic.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Client / Party</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Property Listing</label>
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  {properties.slice(0, 20).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.propertyCode} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Date</label>
                <Input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Time</label>
                <Input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-slate-700">Assigned Field Agent</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
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

            <div className="flex items-center gap-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="pickup"
                checked={pickupRequired}
                onChange={(e) => setPickupRequired(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="pickup" className="font-medium text-slate-800">
                Agency vehicle pickup required from client residence
              </label>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Visit Objectives / Notes</label>
              <Input
                placeholder="e.g. Inspect boundary wall, water pressure, and check roof terrace..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm & Schedule Visit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* POST-VISIT FEEDBACK DIALOG */}
      {/* ============================================================== */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Post-Visit Feedback</DialogTitle>
            <DialogDescription>
              Document party verdict immediately to keep pipeline updated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Feedback Outcome</label>
              <select
                value={feedback}
                onChange={(e) => setFeedback(e.target.value as VisitFeedback)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="Interested">Interested (Wants Offer / Token)</option>
                <option value="Wants second visit">Wants second visit with family</option>
                <option value="Price issue">Price demand too high</option>
                <option value="Location issue">Location / street issue</option>
                <option value="Not interested">Not interested (Reject)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Feedback Detailed Notes</label>
              <Input
                placeholder="Client feedback on room sizes, elevation, counter offer amount..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Next Follow-Up Date</label>
              <Input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Outcome & Complete Visit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

