import { Task, TaskPriority, TaskType } from '@/types';
import { relativeDaysAgo, relativeDaysAhead } from './seedGenerator';

const taskTypes: TaskType[] = [
  'Call back', 'WhatsApp', 'Send documents', 'Visit follow-up', 'Payment follow-up'
];

export function generateInitialTasks(): Task[] {
  const tasks: Task[] = [];
  const agents = ['usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-10'];

  // 14 Overdue tasks (mostly Usman: usr-5)
  for (let i = 1; i <= 14; i++) {
    const isUsman = i <= 9; // 9 of 14 overdue belong to Usman Tariq!
    const agentId = isUsman ? 'usr-5' : agents[i % agents.length];
    const daysOverdue = (i % 7) + 2;
    const taskType = taskTypes[i % taskTypes.length];
    
    tasks.push({
      id: `task-od-${i}`,
      type: taskType,
      title: `${taskType} with client regarding DHA Phase 6 inquiry`,
      linkedLeadId: `lead-${i + 20}`,
      linkedClientId: `client-${i + 5}`,
      agentId,
      dueDateTime: relativeDaysAgo(daysOverdue, -3),
      priority: i % 2 === 0 ? 'High' : 'Medium',
      status: 'Pending',
      createdAt: relativeDaysAgo(daysOverdue + 5),
    });
  }

  // 10 Tasks Today
  for (let i = 1; i <= 10; i++) {
    const agentId = agents[i % agents.length];
    const taskType = taskTypes[(i + 1) % taskTypes.length];
    
    tasks.push({
      id: `task-td-${i}`,
      type: taskType,
      title: `${taskType}: Scheduled customer discussion`,
      linkedLeadId: `lead-${i + 40}`,
      linkedClientId: `client-${i + 12}`,
      agentId,
      dueDateTime: relativeDaysAhead(0, (i % 5) + 1),
      priority: i <= 3 ? 'High' : 'Medium',
      status: 'Pending',
      createdAt: relativeDaysAgo(2),
    });
  }

  // 16 Upcoming Tasks
  for (let i = 1; i <= 16; i++) {
    const agentId = agents[i % agents.length];
    const daysAhead = (i % 8) + 1;
    const taskType = taskTypes[(i + 2) % taskTypes.length];

    tasks.push({
      id: `task-up-${i}`,
      type: taskType,
      title: `${taskType} follow-up for negotiation & docs verification`,
      linkedDealId: i <= 5 ? `deal-${i + 12}` : undefined,
      linkedLeadId: `lead-${i + 55}`,
      agentId,
      dueDateTime: relativeDaysAhead(daysAhead, 4),
      priority: i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
      status: 'Pending',
      createdAt: relativeDaysAgo(1),
    });
  }

  // 20 Completed Tasks
  for (let i = 1; i <= 20; i++) {
    const agentId = agents[i % agents.length];
    const daysAgo = i + 1;
    const taskType = taskTypes[i % taskTypes.length];

    tasks.push({
      id: `task-cmp-${i}`,
      type: taskType,
      title: `Completed: ${taskType} with party`,
      linkedLeadId: `lead-${i}`,
      linkedClientId: `client-${i}`,
      agentId,
      dueDateTime: relativeDaysAgo(daysAgo),
      priority: 'Medium',
      status: 'Completed',
      outcomeNote: 'Discussion completed successfully. Client received required details and agreed to next milestone.',
      completedAt: relativeDaysAgo(daysAgo, 2),
      createdAt: relativeDaysAgo(daysAgo + 3),
    });
  }

  return tasks;
}

export const INITIAL_TASKS = generateInitialTasks();

