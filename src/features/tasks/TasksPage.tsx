import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Task, TaskPriority, TaskType } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { AgentAvatar } from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatDate, formatTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';
import { isPast, isToday, isFuture } from 'date-fns';

export const TasksPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { tasks, addTask, updateTask, completeTask, leads, clients, deals, users } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>('overdue');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');

  // Agent filter for Owner/Manager
  const [filterAgent, setFilterAgent] = useState<string>('all');

  // Form State
  const [type, setType] = useState<TaskType>('Call back');
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState('usr-3');
  const [dueDateTime, setDueDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [priority, setPriority] = useState<TaskPriority>('High');

  const agentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  // Role filtering: Agent sees own tasks only
  const roleFilteredTasks = useMemo(() => {
    if (currentUser?.role === 'Agent') {
      return tasks.filter((t) => t.agentId === currentUser.id);
    }
    return tasks;
  }, [tasks, currentUser]);

  const agentFilteredTasks = useMemo(() => {
    if (filterAgent !== 'all') {
      return roleFilteredTasks.filter((t) => t.agentId === filterAgent);
    }
    return roleFilteredTasks;
  }, [roleFilteredTasks, filterAgent]);

  // Tab categorizations
  const overdueTasks = useMemo(() => {
    return agentFilteredTasks.filter(
      (t) => t.status === 'Pending' && isPast(new Date(t.dueDateTime)) && !isToday(new Date(t.dueDateTime))
    );
  }, [agentFilteredTasks]);

  const todayTasks = useMemo(() => {
    return agentFilteredTasks.filter(
      (t) => t.status === 'Pending' && isToday(new Date(t.dueDateTime))
    );
  }, [agentFilteredTasks]);

  const upcomingTasks = useMemo(() => {
    return agentFilteredTasks.filter(
      (t) => t.status === 'Pending' && isFuture(new Date(t.dueDateTime)) && !isToday(new Date(t.dueDateTime))
    );
  }, [agentFilteredTasks]);

  const completedTasks = useMemo(() => {
    return agentFilteredTasks.filter((t) => t.status === 'Completed');
  }, [agentFilteredTasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTask({
      type,
      title,
      agentId,
      dueDateTime: new Date(dueDateTime).toISOString(),
      priority,
    });

    toast.success('Follow-up task created and assigned.');
    setCreateModalOpen(false);
    setTitle('');
  };

  const handleCompleteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    completeTask(selectedTask.id, outcomeNote || 'Action completed successfully.');
    toast.success('Task marked as completed.');
    setCompleteModalOpen(false);
    setSelectedTask(null);
    setOutcomeNote('');
  };

  const renderTaskList = (taskList: Task[], isOverdue = false) => {
    if (taskList.length === 0) {
      return (
        <div className="text-center py-12 rounded-lg border border-dashed bg-white text-slate-400 text-xs">
          No tasks in this category
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {taskList.map((t) => {
          const agentName = agentsMap[t.agentId] || 'Agent';

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-[10px] border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                isOverdue ? 'border-red-200 bg-red-50/10' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    t.type === 'Call back'
                      ? 'bg-blue-50 text-blue-700'
                      : t.type === 'WhatsApp'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {t.type === 'Call back' && <Phone className="h-4 w-4" />}
                  {t.type === 'WhatsApp' && <MessageSquare className="h-4 w-4" />}
                  {t.type === 'Send documents' && <FileText className="h-4 w-4" />}
                  {t.type === 'Payment follow-up' && <DollarSign className="h-4 w-4" />}
                  {t.type === 'Visit follow-up' && <Calendar className="h-4 w-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{t.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        t.priority === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Due: {formatDate(t.dueDateTime)} ({formatTime(t.dueDateTime)})
                    </span>
                    <div className="flex items-center gap-1">
                      <AgentAvatar name={agentName} size="sm" />
                      <span>{agentName}</span>
                    </div>
                  </div>

                  {t.outcomeNote && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-100 mt-1">
                      <strong>Completed Outcome:</strong> {t.outcomeNote}
                    </p>
                  )}
                </div>
              </div>

              {t.status === 'Pending' && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(t);
                      setCompleteModalOpen(true);
                    }}
                    className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Mark Done
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tasks & Follow-ups"
        description="Enforce lead nurture discipline. Prevents inquiries from slipping through the cracks."
        actions={
          <div className="flex items-center gap-2">
            {can(currentUser?.role, 'view_all_tasks') && (
              <select
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="all">All Agents</option>
                {users
                  .filter((u) => u.role === 'Agent' && u.active)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            )}

            <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Follow-up
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-[480px]">
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdueTasks.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                {overdueTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">
            Today ({todayTasks.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Done ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="pt-4">
          {renderTaskList(overdueTasks, true)}
        </TabsContent>
        <TabsContent value="today" className="pt-4">
          {renderTaskList(todayTasks)}
        </TabsContent>
        <TabsContent value="upcoming" className="pt-4">
          {renderTaskList(upcomingTasks)}
        </TabsContent>
        <TabsContent value="completed" className="pt-4">
          {renderTaskList(completedTasks)}
        </TabsContent>
      </Tabs>

      {/* CREATE TASK MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Follow-up Action</DialogTitle>
            <DialogDescription>
              Assign scheduled task with priority to maintain accountability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Follow-up Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="Call back">Call back</option>
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Send documents">Send Title Documents</option>
                <option value="Visit follow-up">Post-Visit Follow-up</option>
                <option value="Payment follow-up">Token / Payment Follow-up</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Task Title *</label>
              <Input
                required
                placeholder="e.g. Call back Dr. Asad regarding Phase 6 price counter..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Due Date & Time</label>
                <Input
                  type="datetime-local"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Assign Field Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
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

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Schedule Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MARK COMPLETE MODAL WITH OUTCOME NOTE */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Follow-up</DialogTitle>
            <DialogDescription>
              Record the outcome note for the agency audit record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCompleteTask} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-700">Outcome Summary</label>
              <Input
                placeholder="e.g. Spoke to client. Agreed to deposit 50 Lakh Bayana tomorrow."
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Mark Completed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

