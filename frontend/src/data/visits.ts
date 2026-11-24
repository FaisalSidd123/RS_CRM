import { SiteVisit, VisitFeedback, VisitStatus } from '@/types';
import { relativeDaysAgo, relativeDaysAhead } from './seedGenerator';

const feedbacks: VisitFeedback[] = [
  'Interested', 'Wants second visit', 'Price issue', 'Location issue', 'Not interested'
];

export function generateInitialVisits(): SiteVisit[] {
  const visits: SiteVisit[] = [];
  const agents = ['usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-10'];

  // Upcoming visits today and tomorrow
  visits.push({
    id: 'visit-today-1',
    clientId: 'client-1',
    propertyId: 'prop-1',
    agentId: 'usr-3', // Ayesha
    date: relativeDaysAhead(0),
    time: '16:30',
    status: 'Scheduled',
    pickupRequired: true,
    feedbackNotes: 'Buyer arriving from Clifton in agency vehicle. Inspecting 500 sq yd bungalow.',
    createdAt: relativeDaysAgo(2),
  });

  visits.push({
    id: 'visit-today-2',
    clientId: 'client-3',
    propertyId: 'prop-4',
    agentId: 'usr-4', // Bilal
    date: relativeDaysAhead(0),
    time: '18:00',
    status: 'Scheduled',
    pickupRequired: false,
    feedbackNotes: 'Evening viewing of sea-facing Clifton apartment.',
    createdAt: relativeDaysAgo(3),
  });

  visits.push({
    id: 'visit-tomorrow-1',
    clientId: 'client-7',
    propertyId: 'prop-13',
    agentId: 'usr-3',
    date: relativeDaysAhead(1),
    time: '11:00',
    status: 'Scheduled',
    pickupRequired: true,
    feedbackNotes: 'Bahria Town Karachi Precinct 27 Golf Villa tour.',
    createdAt: relativeDaysAgo(1),
  });

  visits.push({
    id: 'visit-tomorrow-2',
    clientId: 'client-11',
    propertyId: 'prop-2',
    agentId: 'usr-5', // Usman
    date: relativeDaysAhead(1),
    time: '15:00',
    status: 'Scheduled',
    pickupRequired: false,
    feedbackNotes: 'Second visit with family elders.',
    createdAt: relativeDaysAgo(2),
  });

  visits.push({
    id: 'visit-ahead-3',
    clientId: 'client-15',
    propertyId: 'prop-8',
    agentId: 'usr-7',
    date: relativeDaysAhead(3),
    time: '17:00',
    status: 'Scheduled',
    pickupRequired: false,
    createdAt: relativeDaysAgo(1),
  });

  // Past 40 visits
  for (let i = 1; i <= 40; i++) {
    const daysAgo = Math.floor(i * 3.5) + 1;
    const isCompleted = i % 8 !== 0;
    const status: VisitStatus = isCompleted ? 'Completed' : (i % 16 === 0 ? 'No Show' : 'Cancelled');
    const feedback = isCompleted ? feedbacks[i % feedbacks.length] : undefined;
    
    let feedbackNotes = '';
    if (feedback === 'Interested') feedbackNotes = 'Client liked interior elevation and asked for final price negotiation with owner.';
    else if (feedback === 'Wants second visit') feedbackNotes = 'Wants to bring wife and structural engineer for dampness and plumbing check.';
    else if (feedback === 'Price issue') feedbackNotes = 'Owner demand is 14 Cr, client cap is 12.5 Cr. Exploring counter offer.';
    else if (feedback === 'Location issue') feedbackNotes = 'Too close to commercial market noise. Preferred quieter street in Phase 6.';
    else if (feedback === 'Not interested') feedbackNotes = 'Floor plan room dimensions were smaller than expected.';

    visits.push({
      id: `visit-past-${i}`,
      clientId: `client-${(i % 50) + 1}`,
      propertyId: `prop-${(i % 30) + 1}`,
      agentId: agents[i % agents.length],
      date: relativeDaysAgo(daysAgo),
      time: `${14 + (i % 6)}:00`,
      status,
      pickupRequired: i % 3 === 0,
      feedback,
      feedbackNotes,
      nextFollowUpDate: isCompleted ? relativeDaysAhead(Math.max(1, 5 - (i % 6))) : undefined,
      createdAt: relativeDaysAgo(daysAgo + 3),
    });
  }

  return visits;
}

export const INITIAL_VISITS = generateInitialVisits();

