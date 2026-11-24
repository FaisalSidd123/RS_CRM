import { Client, ClientType, ClientTag, PropertyType } from '@/types';
import { relativeDaysAgo, createRNG } from './seedGenerator';

const rng = createRNG(987654);

const firstNames = [
  'Tariq', 'Zubair', 'Shahid', 'Naveed', 'Asad', 'Farhan', 'Rashid', 'Waqas', 'Kamran', 'Majid',
  'Hamza', 'Babar', 'Sohail', 'Akhtar', 'Javed', 'Rehan', 'Faisal', 'Adeel', 'Khurram', 'Umair',
  'Sardar', 'Mian', 'Malik', 'Syed', 'Chaudhry', 'Nargis', 'Rubina', 'Samina', 'Ayesha', 'Fatima',
  'Zainab', 'Farida', 'Huma', 'Sadia', 'Bushra', 'Tahira', 'Shazia', 'Nasreen', 'Amber', 'Mehwish',
];

const lastNames = [
  'Mansoor', 'Qazi', 'Hashmi', 'Sethi', 'Rizvi', 'Zaidi', 'Minhas', 'Bhatti', 'Alvi', 'Khan',
  'Abbasi', 'Azam', 'Tanveer', 'Hussain', 'Iqbal', 'Lodhi', 'Ahmed', 'Sheikh', 'Dar', 'Ashraf',
  'Pervaiz', 'Mansha', 'Riaz', 'Raza', 'Kiani', 'Parveen', 'Siddiqui', 'Malik', 'Qureshi', 'Chaudhry',
];

const cities = ['Karachi', 'Karachi', 'Karachi', 'Karachi', 'Lahore', 'Lahore', 'Islamabad', 'London (Overseas)', 'Dubai (Overseas)', 'Riyadh (Overseas)'];

const areasPool = [
  'DHA Phase 6', 'DHA Phase 5', 'DHA Phase 8', 'Clifton Block 4', 'Clifton Block 2',
  'Bahria Town Karachi', 'Gulshan-e-Iqbal', 'PECHS', 'Scheme 33', 'DHA Phase 5 Lahore',
  'Gulberg Lahore', 'F-7 Islamabad', 'Bahria Enclave Islamabad'
];

export function generateInitialClients(): Client[] {
  const clients: Client[] = [];
  const agents = ['usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-10'];

  for (let i = 1; i <= 80; i++) {
    const fName = firstNames[(i * 3) % firstNames.length];
    const lName = lastNames[(i * 7) % lastNames.length];
    const city = cities[i % cities.length];
    const isOverseas = city.includes('Overseas');
    
    // Determine types
    const types: ClientType[] = [];
    if (i % 2 === 0) types.push('Buyer');
    if (i % 3 === 0) types.push('Seller');
    if (i % 5 === 0) types.push('Investor');
    if (i % 7 === 0) types.push('Landlord');
    if (i % 11 === 0) types.push('Tenant');
    if (types.length === 0) types.push('Buyer');

    // Tags
    const tags: ClientTag[] = [];
    if (isOverseas || i % 8 === 0) tags.push('Overseas Pakistani');
    if (i % 6 === 0) tags.push('VIP');
    if (i % 10 === 0) tags.push('Repeat client');

    const budgetMin = (i % 4 + 1) * 20000000; // 2 Cr to 8 Cr
    const budgetMax = budgetMin + 40000000;

    const loc1 = areasPool[i % areasPool.length];
    const loc2 = areasPool[(i + 3) % areasPool.length];

    const propTypes: PropertyType[] = i % 2 === 0 ? ['House'] : ['Apartment', 'Plot'];

    clients.push({
      id: `client-${i}`,
      name: `${fName} ${lName}`,
      phone: `03${(i * 13) % 4 + 1}0-${1000000 + i * 87654}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`,
      cnic: `42201-XXXXXXX-${(i * 3) % 9 + 1}`,
      city: isOverseas ? city.split(' ')[0] : city,
      types,
      budgetMin,
      budgetMax,
      preferredLocations: [loc1, loc2],
      preferredPropertyType: propTypes,
      assignedAgentId: agents[i % agents.length],
      linkedPropertyIds: i % 3 === 0 ? [`prop-${(i % 30) + 1}`] : [],
      linkedDealIds: i <= 22 ? [`deal-${i}`] : [],
      tags,
      notes: isOverseas 
        ? 'Overseas client based abroad. Prefers WhatsApp communication and video call walk-throughs. Ready funds in Roshan Digital Account (RDA).'
        : 'Genuine party, family residence requirement. Prefers clear documentation and fast transfer.',
      createdAt: relativeDaysAgo(Math.min(180, i * 2 + 5)),
    });
  }

  return clients;
}

export const INITIAL_CLIENTS = generateInitialClients();

