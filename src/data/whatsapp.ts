import { WhatsAppRule, WhatsAppTemplate, WhatsAppLog } from '@/types';
import { relativeDaysAgo } from './seedGenerator';

export const INITIAL_WHATSAPP_RULES: WhatsAppRule[] = [
  {
    id: 'rule-1',
    name: 'Welcome message on new lead',
    description: 'Instantly send a professional greeting and agency brochure when a lead is captured from Zameen, FB, or Web.',
    enabled: true,
    trigger: 'New Lead Created',
  },
  {
    id: 'rule-2',
    name: 'Site visit reminder 2 hours before',
    description: 'Send client and driver vehicle location, agent contact, and meeting point 2 hours prior to visit.',
    enabled: true,
    trigger: '2 Hours Before Site Visit',
  },
  {
    id: 'rule-3',
    name: 'Follow-up reminder to agent',
    description: 'Notify assigned agent on WhatsApp when a scheduled follow-up is due in 30 minutes or overdue.',
    enabled: true,
    trigger: 'Task Due / Overdue Alert',
  },
  {
    id: 'rule-4',
    name: 'New property alert to matching clients',
    description: 'Automatically broadcast newly listed properties to serious buyers matching budget and location filters.',
    enabled: false,
    trigger: 'New Property Listed (Available)',
  },
  {
    id: 'rule-5',
    name: 'Payment due reminder (Bayana / Transfer)',
    description: 'Send polite payment milestone reminders to buyer 3 days before token balance or final pay order is due.',
    enabled: true,
    trigger: 'Deal Payment Milestone Due',
  },
];

export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Lead Welcome & Introduction',
    category: 'Marketing',
    language: 'English',
    status: 'Approved',
    body: 'Assalam-o-Alaikum {{client_name}}, thank you for contacting Crescent Realty & Builders. Our senior property advisor {{agent_name}} has been assigned to assist you with {{property_type}} in {{location}}. You can reach us directly at {{agent_phone}}.',
  },
  {
    id: 'tpl-2',
    name: 'Lead Welcome (Roman Urdu)',
    category: 'Marketing',
    language: 'Roman Urdu',
    status: 'Approved',
    body: 'Assalam-o-Alaikum {{client_name}} bhai! Crescent Realty se rabta karne ka shukriya. Aapki inquiry {{location}} ke hawale se hamare consultant {{agent_name}} ko assign kar di gayi hai. Woh jald aapse rabta karenge.',
  },
  {
    id: 'tpl-3',
    name: 'Site Visit Confirmation & Directions',
    category: 'Utility',
    language: 'English',
    status: 'Approved',
    body: 'Dear {{client_name}}, your site visit for {{property_title}} is scheduled today at {{visit_time}}. Our advisor {{agent_name}} will meet you at the property. Google Maps location: {{location_link}}.',
  },
  {
    id: 'tpl-4',
    name: 'Site Visit Reminder (Roman Urdu)',
    category: 'Utility',
    language: 'Roman Urdu',
    status: 'Approved',
    body: 'Mohtaram {{client_name}} sahab, yaad dehani ke liye arz hai ke aapki site visit {{property_title}} ke liye aaj {{visit_time}} par tay shuda hai. Agar time reschedule karna ho toh baraye meherbani aagah farmayein.',
  },
  {
    id: 'tpl-5',
    name: 'New Listing Match Alert',
    category: 'Marketing',
    language: 'English',
    status: 'Approved',
    body: 'Hot Property Alert! A new {{size}} {{property_type}} has just been listed in {{location}} for {{price}}. Complete papers vetted. Would you like to view photos and schedule a visit this weekend?',
  },
  {
    id: 'tpl-6',
    name: 'New Listing Alert (Roman Urdu)',
    category: 'Marketing',
    language: 'Roman Urdu',
    status: 'Approved',
    body: 'Naya Option Aaya Hai: {{size}} ka shandaar {{property_type}} {{location}} mein direct owner demand {{price}} par dastyab hai. Documents verified hain. Tafseelat ke liye reply karein.',
  },
  {
    id: 'tpl-7',
    name: 'Post-Visit Feedback Follow-up',
    category: 'Service',
    language: 'English',
    status: 'Approved',
    body: 'Hi {{client_name}}, thank you for taking the time to inspect {{property_title}} today. We would love to know your thoughts. Does this match your requirements, or should we arrange another option?',
  },
  {
    id: 'tpl-8',
    name: 'Token / Bayana Milestone Due',
    category: 'Utility',
    language: 'English',
    status: 'Approved',
    body: 'Dear {{client_name}}, this is a friendly reminder that the token balance payment of {{amount}} for deal {{deal_code}} is due on {{due_date}}. Kindly prepare the pay order in favor of the seller.',
  },
  {
    id: 'tpl-9',
    name: 'Payment Reminder (Roman Urdu)',
    category: 'Utility',
    language: 'Roman Urdu',
    status: 'Approved',
    body: 'Mohtaram {{client_name}}, deal {{deal_code}} ki baqaya bayana raqam {{amount}} {{due_date}} ko ada karni hai. Baraye meherbani tayyari mukammal rakhein taake transfer marhala baghair takheer mukammal ho sake.',
  },
  {
    id: 'tpl-10',
    name: 'Overseas Pakistani Virtual Tour Invitation',
    category: 'Marketing',
    language: 'English',
    status: 'Pending approval',
    body: 'Dear {{client_name}}, as an overseas buyer, we have prepared a high-resolution 4K walkthrough and legal verification dossier for {{property_title}}. Can we schedule a 15-minute WhatsApp video briefing tomorrow?',
  },
];

export function generateInitialWhatsAppLogs(): WhatsAppLog[] {
  const logs: WhatsAppLog[] = [];
  const clientNames = [
    'Tariq Mansoor', 'Shahid Hashmi', 'Nargis Parveen', 'Farhan Zaidi', 'Sheikh Waqar',
    'Akhtar Hussain', 'Majid Khan', 'Sohail Tanveer', 'Chaudhry Pervaiz', 'Col. Irfan Kiani',
    'Mian Mansha', 'Dr. Asad Rizvi', 'Hamza Abbasi', 'Rehan Lodhi', 'Zubair Qazi'
  ];
  const statuses: ('Sent' | 'Delivered' | 'Read' | 'Failed')[] = ['Read', 'Read', 'Read', 'Delivered', 'Sent', 'Failed'];

  for (let i = 1; i <= 80; i++) {
    const daysAgo = Math.floor(i * 1.5);
    const clientName = clientNames[i % clientNames.length];
    const template = INITIAL_WHATSAPP_TEMPLATES[i % INITIAL_WHATSAPP_TEMPLATES.length];
    const status = statuses[i % statuses.length];

    logs.push({
      id: `wlog-${i}`,
      recipientName: clientName,
      recipientPhone: `0300-${2340000 + i * 111}`,
      templateName: template.name,
      sentAt: relativeDaysAgo(daysAgo, (i % 8)),
      status,
    });
  }

  return logs;
}

export const INITIAL_WHATSAPP_LOGS = generateInitialWhatsAppLogs();

