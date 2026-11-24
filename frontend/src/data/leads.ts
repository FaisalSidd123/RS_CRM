import { Lead, LeadInterest, LeadSource, LeadStatus, LeadTemperature, PropertyType } from '@/types';
import { relativeDaysAgo, relativeDaysAhead } from './seedGenerator';

const leadNames = [
  'Farooq Sattar', 'Junaid Jamshed', 'Waseem Akram', 'Shoaib Akhtar', 'Moin Khan',
  'Inzamam ul Haq', 'Saeed Anwar', 'Mushtaq Ahmed', 'Younis Khan', 'Misbah ul Haq',
  'Shahid Afridi', 'Kamran Akmal', 'Umar Gul', 'Saeed Ajmal', 'Yasir Shah',
  'Sarfaraz Ahmed', 'Babar Azam', 'Mohammad Rizwan', 'Shaheen Afridi', 'Naseem Shah',
  'Shadab Khan', 'Haris Rauf', 'Fakhar Zaman', 'Imam ul Haq', 'Shan Masood',
  'Saud Shakeel', 'Abdullah Shafique', 'Agha Salman', 'Mirza Baig', 'Noman Ali',
  'Abrar Ahmed', 'Hassan Ali', 'Mohammad Amir', 'Wahab Riaz', 'Sohail Khan',
  'Tanvir Ahmed', 'Abdur Rehman', 'Danish Kaneria', 'Taufeeq Umar', 'Imran Nazir',
  'Naved ul Hasan', 'Mohammad Sami', 'Rana Naved', 'Shoaib Malik', 'Abdul Razzaq',
  'Azhar Mahmood', 'Rashid Latif', 'Aamer Sohail', 'Saleem Malik', 'Ijaz Ahmed',
];

const sources: LeadSource[] = [
  'Zameen', 'Zameen', 'Zameen',
  'Facebook', 'Facebook',
  'WhatsApp', 'WhatsApp',
  'Phone',
  'Instagram',
  'Walk-in',
  'Referral',
];

const statuses: LeadStatus[] = [
  'New', 'Contacted', 'Qualified', 'Visit Scheduled', 'Visit Done', 'Negotiation', 'Won', 'Lost'
];

export function generateInitialLeads(): Lead[] {
  const leads: Lead[] = [];
  const agents = ['usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-10'];

  // Intentional duplicate phone numbers for demonstration
  const duplicatePhones = [
    { phone: '0300-8889901', name: 'Zulfiqar Ali Bhutto' },
    { phone: '0321-7776655', name: 'Nawaz Sharif' },
    { phone: '0333-4443322', name: 'Benazir Kausar' },
    { phone: '0345-1112233', name: 'Asif Zardari' },
    { phone: '0312-9998877', name: 'Altaf Hussain' },
    { phone: '0301-5556677', name: 'Pervez Musharraf' },
    { phone: '0334-2223344', name: 'Ayub Khan' },
    { phone: '0308-3334455', name: 'Liaquat Merchant' },
  ];

  for (let i = 1; i <= 120; i++) {
    const isUnassigned = i >= 100 && i <= 108; // 9 fresh unassigned incoming inquiries!
    const isKamranLead = i <= 23; // First 23 leads assigned to Kamran Shaikh (inactive agent!)
    const assignedAgentId = isUnassigned
      ? ''
      : isKamranLead
      ? 'usr-9'
      : i <= 45
      ? 'usr-5'
      : agents[i % agents.length]; // Usman has many leads
    
    // Recent months busier
    const daysAgo = isUnassigned ? (i % 3) : Math.floor(Math.pow((121 - i) / 120, 1.8) * 170) + 1;
    
    const name = leadNames[i % leadNames.length] + (i > 50 ? ` (${i})` : '');
    const source = isUnassigned ? (i % 2 === 0 ? 'Zameen' : 'Facebook') : sources[i % sources.length];
    const interest: LeadInterest = i % 4 === 0 ? 'Rent' : (i % 7 === 0 ? 'Invest' : 'Buy');
    const propertyType: PropertyType = i % 3 === 0 ? 'Apartment' : (i % 5 === 0 ? 'Plot' : 'House');
    const temperature: LeadTemperature = isUnassigned ? 'Hot' : (i % 5 === 0 ? 'Hot' : (i % 3 === 0 ? 'Warm' : 'Cold'));
    const status: LeadStatus = isUnassigned ? 'New' : statuses[i % statuses.length];

    // Overdue follow-up check: Usman (usr-5) has lots of overdue follow-ups
    let nextFollowUp: string | undefined;
    if (assignedAgentId === 'usr-5' && i % 2 === 0) {
      // Overdue: 3 to 14 days in past
      nextFollowUp = relativeDaysAgo((i % 10) + 2);
    } else if (i % 3 === 0) {
      // Upcoming: 1 to 5 days ahead
      nextFollowUp = relativeDaysAhead((i % 5) + 1);
    } else if (i % 7 === 0) {
      // Today follow up
      nextFollowUp = relativeDaysAhead(0, 2);
    }

    const budgetMin = (i % 5 + 1) * 25000000;
    const budgetMax = budgetMin + 30000000;

    let phone = `03${(i * 11) % 4 + 1}0-${2000000 + i * 54321}`;
    let isDuplicate = false;
    let duplicateOfLeadId: string | undefined;

    // Inject duplicate leads
    if (i >= 110 && i < 110 + duplicatePhones.length) {
      const dup = duplicatePhones[i - 110];
      if (dup) {
        phone = dup.phone;
        isDuplicate = true;
        duplicateOfLeadId = `lead-${i - 30}`; // Refers to an earlier lead
      }
    } else if (i >= 80 && i < 80 + duplicatePhones.length) {
      const dup = duplicatePhones[i - 80];
      if (dup) {
        phone = dup.phone;
      }
    }

    const dupEntry = isDuplicate && i >= 110 ? duplicatePhones[i - 110] : null;

    leads.push({
      id: `lead-${i}`,
      name: dupEntry ? dupEntry.name : name,
      phone,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      source,
      interest,
      propertyType,
      budgetMin,
      budgetMax,
      preferredLocations: ['DHA Phase 6', 'Clifton Block 4', 'Bahria Town Karachi'],
      assignedAgentId,
      temperature,
      status,
      nextFollowUpDate: nextFollowUp,
      notes: isDuplicate
        ? 'Duplicate inquiry detected via Facebook Ads. Already in touch with Ayesha Khan on Zameen.'
        : isUnassigned
        ? `Fresh ${source} digital inquiry. High buyer intent for ${propertyType} in DHA/Clifton. Ready to assign to field agent.`
        : `Looking for ready to move ${propertyType} in DHA/Clifton. Clear budget and verified requirement.`,
      createdAt: relativeDaysAgo(daysAgo),
      isDuplicate,
      duplicateOfLeadId,
      activities: isUnassigned
        ? [
            {
              id: `act-${i}-1`,
              type: 'Note',
              description: `Automated intake captured via ${source} Marketing API. Awaiting agent assignment.`,
              outcome: 'Unassigned inquiry queued in agency portal.',
              createdAt: relativeDaysAgo(daysAgo),
              authorName: 'Intake System',
            },
          ]
        : [
            {
              id: `act-${i}-1`,
              type: 'Call',
              description: 'Initial inquiry verification call.',
              outcome: 'Client confirmed budget and requested WhatsApp property brochures.',
              createdAt: relativeDaysAgo(daysAgo),
              authorName: assignedAgentId === 'usr-3' ? 'Ayesha Khan' : 'Assigned Agent',
            },
            {
              id: `act-${i}-2`,
              type: 'WhatsApp',
              description: 'Shared 3 curated listings with video links.',
              outcome: 'Client viewed and shortlisted 2 options for site visit.',
              createdAt: relativeDaysAgo(Math.max(1, daysAgo - 2)),
              authorName: assignedAgentId === 'usr-3' ? 'Ayesha Khan' : 'Assigned Agent',
            },
          ],
    });
  }

  return leads;
}

export const INITIAL_LEADS = generateInitialLeads();

