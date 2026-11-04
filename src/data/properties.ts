import { Property, AreaUnit, PropertyPurpose, PropertyStatus, PropertyType } from '@/types';
import { relativeDaysAgo, createRNG } from './seedGenerator';

const rng = createRNG(777123);

const propertyImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
];

interface PropSeed {
  code: string;
  title: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  city: 'Karachi' | 'Lahore' | 'Islamabad';
  area: string;
  blockPhase: string;
  size: number;
  sizeUnit: AreaUnit;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  ownerName: string;
  ownerPhone: string;
  status: PropertyStatus;
  agentId: string;
  daysAgo: number;
  isStale?: boolean;
  isPossibleDuplicate?: boolean;
  isSoldStillListed?: boolean;
  isFeatured?: boolean;
}

const rawProps: PropSeed[] = [
  // 1-10 Karachi DHA & Clifton
  {
    code: 'PK-DHA-0142',
    title: 'Brand New 500 Sq Yd Luxury Designer Bungalow',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'DHA Phase 6',
    blockPhase: 'Khayaban-e-Seher',
    size: 500,
    sizeUnit: 'sq yd',
    price: 135000000, // 13.5 Crore
    bedrooms: 5,
    bathrooms: 6,
    ownerName: 'Tariq Mansoor',
    ownerPhone: '0300-9281726',
    status: 'Available',
    agentId: 'usr-3', // Ayesha
    daysAgo: 14,
    isFeatured: true,
  },
  {
    code: 'PK-DHA-0143',
    title: '500 Sq Yd Modern House with Basement & Pool',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'DHA Phase 6',
    blockPhase: 'Khayaban-e-Bukhari',
    size: 500,
    sizeUnit: 'sq yd',
    price: 142000000, // 14.2 Crore
    bedrooms: 6,
    bathrooms: 7,
    ownerName: 'Shahid Hashmi',
    ownerPhone: '0321-4455667',
    status: 'Under Offer',
    agentId: 'usr-4', // Bilal
    daysAgo: 25,
  },
  {
    code: 'PK-DHA-0144',
    title: '1000 Sq Yd Ambassadorial Mansion',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'DHA Phase 8',
    blockPhase: 'Zone A',
    size: 1000,
    sizeUnit: 'sq yd',
    price: 280000000, // 28 Crore
    bedrooms: 7,
    bathrooms: 8,
    ownerName: 'Malik Jahangir',
    ownerPhone: '0300-8877665',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 5,
    isFeatured: true,
  },
  {
    code: 'PK-CLF-0081',
    title: '3-Bed Sea-Facing Luxury Apartment',
    purpose: 'Sale',
    type: 'Apartment',
    city: 'Karachi',
    area: 'Clifton',
    blockPhase: 'Block 4',
    size: 2400,
    sizeUnit: 'sq ft',
    price: 48000000, // 4.8 Crore
    bedrooms: 3,
    bathrooms: 4,
    ownerName: 'Mrs. Nargis Parveen',
    ownerPhone: '0333-2211009',
    status: 'Available',
    agentId: 'usr-4',
    daysAgo: 18,
  },
  {
    code: 'PK-CLF-0082',
    title: 'Executive 2-Bed Furnished Apartment for Rent',
    purpose: 'Rent',
    type: 'Apartment',
    city: 'Karachi',
    area: 'Clifton',
    blockPhase: 'Block 2',
    size: 1600,
    sizeUnit: 'sq ft',
    price: 250000, // 2.5 Lakh / month
    bedrooms: 2,
    bathrooms: 2,
    ownerName: 'Farhan Zaidi',
    ownerPhone: '0302-3344556',
    status: 'Available',
    agentId: 'usr-6', // Hira
    daysAgo: 8,
  },
  {
    code: 'PK-DHA-0145',
    title: '300 Sq Yd Corner Villa with Garden',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'DHA Phase 5',
    blockPhase: 'Khayaban-e-Shamsheer',
    size: 300,
    sizeUnit: 'sq yd',
    price: 88000000, // 8.8 Crore
    bedrooms: 4,
    bathrooms: 5,
    ownerName: 'Kamran Alvi',
    ownerPhone: '0345-1239874',
    status: 'Sold',
    agentId: 'usr-3',
    daysAgo: 60,
  },
  {
    code: 'PK-DHA-0146',
    title: '200 Sq Yd Spanish Bungalow with Roof Terrace',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'DHA Phase 2',
    blockPhase: 'Commercial Ave',
    size: 200,
    sizeUnit: 'sq yd',
    price: 62000000, // 6.2 Crore
    bedrooms: 4,
    bathrooms: 4,
    ownerName: 'Dr. Asad Rizvi',
    ownerPhone: '0300-5544332',
    status: 'Sold',
    agentId: 'usr-5', // Usman
    daysAgo: 75,
    isSoldStillListed: true, // Warning: Sold but still marked active/featured
  },
  {
    code: 'PK-CLF-0083',
    title: '4-Bed Penthouse with Private Terrace',
    purpose: 'Sale',
    type: 'Apartment',
    city: 'Karachi',
    area: 'Clifton',
    blockPhase: 'Block 5',
    size: 3600,
    sizeUnit: 'sq ft',
    price: 85000000, // 8.5 Crore
    bedrooms: 4,
    bathrooms: 5,
    ownerName: 'Naveed Sethi',
    ownerPhone: '0321-9988112',
    status: 'Available',
    agentId: 'usr-7', // Zain
    daysAgo: 22,
  },
  {
    code: 'PK-DHA-0147',
    title: '500 Sq Yd Commercial Plot for High-Rise',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Karachi',
    area: 'DHA Phase 8',
    blockPhase: 'Commercial Zone C',
    size: 500,
    sizeUnit: 'sq yd',
    price: 180000000, // 18 Crore
    ownerName: 'Sheikh Waqar',
    ownerPhone: '0300-7766554',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 35,
  },
  {
    code: 'PK-DHA-0148',
    title: '500 Sq Yd Commercial Plot for High-Rise (Duplicate Listing)',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Karachi',
    area: 'DHA Phase 8',
    blockPhase: 'Commercial Zone C',
    size: 500,
    sizeUnit: 'sq yd',
    price: 175000000,
    ownerName: 'Sheikh Waqar',
    ownerPhone: '0300-7766554',
    status: 'Available',
    agentId: 'usr-8',
    daysAgo: 10,
    isPossibleDuplicate: true, // Duplicate property warning
  },

  // 11-20 Bahria Town Karachi & Scheme 33
  {
    code: 'PK-BTK-0201',
    title: '120 Sq Yd Designer Villa in Precinct 1',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'Bahria Town Karachi',
    blockPhase: 'Precinct 1',
    size: 120,
    sizeUnit: 'sq yd',
    price: 16500000, // 1.65 Crore
    bedrooms: 3,
    bathrooms: 3,
    ownerName: 'Akhtar Hussain',
    ownerPhone: '0313-9871234',
    status: 'Available',
    agentId: 'usr-4',
    daysAgo: 12,
  },
  {
    code: 'PK-BTK-0202',
    title: '125 Sq Yd Residential Plot Precinct 10',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Karachi',
    area: 'Bahria Town Karachi',
    blockPhase: 'Precinct 10',
    size: 125,
    sizeUnit: 'sq yd',
    price: 7200000, // 72 Lakh
    ownerName: 'Rashid Minhas',
    ownerPhone: '0303-6655441',
    status: 'Sold',
    agentId: 'usr-4',
    daysAgo: 45,
  },
  {
    code: 'PK-BTK-0203',
    title: '500 Sq Yd Luxury Golf View Villa',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'Bahria Town Karachi',
    blockPhase: 'Precinct 27',
    size: 500,
    sizeUnit: 'sq yd',
    price: 52000000, // 5.2 Crore
    bedrooms: 5,
    bathrooms: 6,
    ownerName: 'Adnan Siddiqui',
    ownerPhone: '0322-8765432',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 7,
    isFeatured: true,
  },
  {
    code: 'PK-BTK-0204',
    title: '2-Bed Apartment in Midway Commercial',
    purpose: 'Rent',
    type: 'Apartment',
    city: 'Karachi',
    area: 'Bahria Town Karachi',
    blockPhase: 'Midway Commercial A',
    size: 1100,
    sizeUnit: 'sq ft',
    price: 65000, // 65,000 / month
    bedrooms: 2,
    bathrooms: 2,
    ownerName: 'Babar Azam',
    ownerPhone: '0345-3344112',
    status: 'Rented',
    agentId: 'usr-8',
    daysAgo: 30,
  },
  {
    code: 'PK-SCH-0051',
    title: '240 Sq Yd Single Storey House for Renovation',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'Scheme 33',
    blockPhase: 'Sector 34-A',
    size: 240,
    sizeUnit: 'sq yd',
    price: 24000000, // 2.4 Crore
    bedrooms: 3,
    bathrooms: 3,
    ownerName: 'Majid Khan',
    ownerPhone: '0315-4433221',
    status: 'Available',
    agentId: 'usr-5',
    daysAgo: 85,
    isStale: true, // Stale listing > 60 days
  },
  {
    code: 'PK-SCH-0052',
    title: '240 Sq Yd Single Storey House Sector 34-A (Duplicate)',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'Scheme 33',
    blockPhase: 'Sector 34-A',
    size: 240,
    sizeUnit: 'sq yd',
    price: 23500000,
    bedrooms: 3,
    bathrooms: 3,
    ownerName: 'Majid Khan',
    ownerPhone: '0315-4433221',
    status: 'Available',
    agentId: 'usr-7',
    daysAgo: 20,
    isPossibleDuplicate: true,
  },
  {
    code: 'PK-GLS-0041',
    title: '400 Sq Yd Renovated Bangalow Gulshan Block 6',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'Gulshan-e-Iqbal',
    blockPhase: 'Block 6',
    size: 400,
    sizeUnit: 'sq yd',
    price: 68000000, // 6.8 Crore
    bedrooms: 5,
    bathrooms: 5,
    ownerName: 'Zubair Qazi',
    ownerPhone: '0300-1122998',
    status: 'Available',
    agentId: 'usr-6',
    daysAgo: 16,
  },
  {
    code: 'PK-PEC-0031',
    title: '1000 Sq Yd Commercial Plot Main Shahrah-e-Faisal',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Karachi',
    area: 'PECHS',
    blockPhase: 'Block 6',
    size: 1000,
    sizeUnit: 'sq yd',
    price: 320000000, // 32 Crore
    ownerName: 'Haji Abdul Sattar',
    ownerPhone: '0321-7788990',
    status: 'Under Offer',
    agentId: 'usr-3',
    daysAgo: 19,
    isFeatured: true,
  },
  {
    code: 'PK-NNZ-0021',
    title: '240 Sq Yd Double Storey House North Nazimabad Block B',
    purpose: 'Sale',
    type: 'House',
    city: 'Karachi',
    area: 'North Nazimabad',
    blockPhase: 'Block B',
    size: 240,
    sizeUnit: 'sq yd',
    price: 39000000, // 3.9 Crore
    bedrooms: 4,
    bathrooms: 4,
    ownerName: 'Sohail Tanveer',
    ownerPhone: '0333-8877112',
    status: 'Sold',
    agentId: 'usr-4',
    daysAgo: 50,
  },
  {
    code: 'PK-GJU-0015',
    title: '3-Bed Apartment Saima Luxury Towers',
    purpose: 'Sale',
    type: 'Apartment',
    city: 'Karachi',
    area: 'Gulistan-e-Jauhar',
    blockPhase: 'Block 15',
    size: 1800,
    sizeUnit: 'sq ft',
    price: 21000000, // 2.1 Crore
    bedrooms: 3,
    bathrooms: 3,
    ownerName: 'Rehan Lodhi',
    ownerPhone: '0346-5544332',
    status: 'Available',
    agentId: 'usr-8',
    daysAgo: 92,
    isStale: true, // Stale
  },

  // 21-30 Lahore Listings
  {
    code: 'PK-LHR-DHA-0501',
    title: '1 Kanal Brand New Spanish Bungalow DHA Phase 5',
    purpose: 'Sale',
    type: 'House',
    city: 'Lahore',
    area: 'DHA Phase 5',
    blockPhase: 'Sector C',
    size: 1,
    sizeUnit: 'Kanal',
    price: 98000000, // 9.8 Crore
    bedrooms: 5,
    bathrooms: 6,
    ownerName: 'Chaudhry Pervaiz',
    ownerPhone: '0300-8456123',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 9,
    isFeatured: true,
  },
  {
    code: 'PK-LHR-DHA-0502',
    title: '10 Marla Modern House Near Commercial Broadway',
    purpose: 'Sale',
    type: 'House',
    city: 'Lahore',
    area: 'DHA Phase 5',
    blockPhase: 'Sector G',
    size: 10,
    sizeUnit: 'Marla',
    price: 54000000, // 5.4 Crore
    bedrooms: 4,
    bathrooms: 5,
    ownerName: 'Usman Dar',
    ownerPhone: '0321-4567890',
    status: 'Under Offer',
    agentId: 'usr-4',
    daysAgo: 14,
  },
  {
    code: 'PK-LHR-DHA-0601',
    title: '2 Kanal Majestic Corner Villa DHA Phase 6',
    purpose: 'Sale',
    type: 'House',
    city: 'Lahore',
    area: 'DHA Phase 6',
    blockPhase: 'Sector A',
    size: 2,
    sizeUnit: 'Kanal',
    price: 210000000, // 21 Crore
    bedrooms: 6,
    bathrooms: 7,
    ownerName: 'Mian Mansha Group',
    ownerPhone: '0300-9911223',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 28,
  },
  {
    code: 'PK-LHR-BTL-0110',
    title: '10 Marla Safari Villas Bahria Town Lahore',
    purpose: 'Sale',
    type: 'House',
    city: 'Lahore',
    area: 'Bahria Town Lahore',
    blockPhase: 'Sector B',
    size: 10,
    sizeUnit: 'Marla',
    price: 38000000, // 3.8 Crore
    bedrooms: 4,
    bathrooms: 4,
    ownerName: 'Mrs. Rubina Ashraf',
    ownerPhone: '0334-1122334',
    status: 'Sold',
    agentId: 'usr-7',
    daysAgo: 80,
  },
  {
    code: 'PK-LHR-GLB-0205',
    title: 'Full Floor Office Space Gulberg III MM Alam Road',
    purpose: 'Rent',
    type: 'Office',
    city: 'Lahore',
    area: 'Gulberg',
    blockPhase: 'Gulberg III',
    size: 4500,
    sizeUnit: 'sq ft',
    price: 850000, // 8.5 Lakh / month
    ownerName: 'Syed Ali Raza',
    ownerPhone: '0301-7766112',
    status: 'Rented',
    agentId: 'usr-4',
    daysAgo: 40,
  },
  {
    code: 'PK-LHR-JHR-0033',
    title: '1 Kanal Residential Plot Johar Town Block G',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Lahore',
    area: 'Johar Town',
    blockPhase: 'Block G-3',
    size: 1,
    sizeUnit: 'Kanal',
    price: 49000000, // 4.9 Crore
    ownerName: 'Malik Riaz Qasim',
    ownerPhone: '0322-6677889',
    status: 'Available',
    agentId: 'usr-10',
    daysAgo: 11,
  },

  // 31-40 Islamabad Listings
  {
    code: 'PK-ISB-F7-0101',
    title: '500 Sq Yd Classical Diplomatic Residence F-7/2',
    purpose: 'Sale',
    type: 'House',
    city: 'Islamabad',
    area: 'F-7',
    blockPhase: 'F-7/2',
    size: 500,
    sizeUnit: 'sq yd',
    price: 195000000, // 19.5 Crore
    bedrooms: 5,
    bathrooms: 6,
    ownerName: 'Sardar Tanveer',
    ownerPhone: '0300-5511223',
    status: 'Available',
    agentId: 'usr-3',
    daysAgo: 6,
    isFeatured: true,
  },
  {
    code: 'PK-ISB-E11-0088',
    title: '3-Bed Luxurious Apartment MPCHS Multi Gardens E-11',
    purpose: 'Sale',
    type: 'Apartment',
    city: 'Islamabad',
    area: 'E-11',
    blockPhase: 'Sector E-11/3',
    size: 2200,
    sizeUnit: 'sq ft',
    price: 36000000, // 3.6 Crore
    bedrooms: 3,
    bathrooms: 3,
    ownerName: 'Waqas Bhatti',
    ownerPhone: '0333-5566778',
    status: 'Available',
    agentId: 'usr-6',
    daysAgo: 15,
  },
  {
    code: 'PK-ISB-BEN-0140',
    title: '1 Kanal Hill View Plot Sector C Bahria Enclave',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Islamabad',
    area: 'Bahria Enclave',
    blockPhase: 'Sector C',
    size: 1,
    sizeUnit: 'Kanal',
    price: 32000000, // 3.2 Crore
    ownerName: 'Hamza Abbasi',
    ownerPhone: '0345-8899001',
    status: 'Available',
    agentId: 'usr-7',
    daysAgo: 70,
    isStale: true, // Stale
  },
  {
    code: 'PK-ISB-BEN-0141',
    title: '1 Kanal Hill View Plot Sector C (Duplicate)',
    purpose: 'Sale',
    type: 'Plot',
    city: 'Islamabad',
    area: 'Bahria Enclave',
    blockPhase: 'Sector C',
    size: 1,
    sizeUnit: 'Kanal',
    price: 31500000,
    ownerName: 'Hamza Abbasi',
    ownerPhone: '0345-8899001',
    status: 'Available',
    agentId: 'usr-8',
    daysAgo: 14,
    isPossibleDuplicate: true,
  },
  {
    code: 'PK-ISB-DHA2-0050',
    title: '10 Marla Solid Construction House Sector B DHA 2',
    purpose: 'Sale',
    type: 'House',
    city: 'Islamabad',
    area: 'DHA Phase 2',
    blockPhase: 'Sector B',
    size: 10,
    sizeUnit: 'Marla',
    price: 61000000, // 6.1 Crore
    bedrooms: 4,
    bathrooms: 5,
    ownerName: 'Col. (R) Irfan Kiani',
    ownerPhone: '0300-5123456',
    status: 'Sold',
    agentId: 'usr-4',
    daysAgo: 42,
  },
];

// Helper to generate 60 full properties deterministically
export function generateInitialProperties(): Property[] {
  const properties: Property[] = [];
  
  // First add our curated 31 properties
  rawProps.forEach((p, idx) => {
    const docStatus1 = idx % 3 === 0 ? 'uploaded' : 'uploaded';
    const docStatus2 = idx % 4 === 0 ? 'missing' : 'uploaded';
    const docStatus3 = idx % 5 === 0 ? 'missing' : 'uploaded';

    properties.push({
      id: `prop-${idx + 1}`,
      propertyCode: p.code,
      title: p.title,
      purpose: p.purpose,
      type: p.type,
      city: p.city,
      area: p.area,
      blockPhase: p.blockPhase,
      size: p.size,
      sizeUnit: p.sizeUnit,
      price: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      ownerName: p.ownerName,
      ownerPhone: p.ownerPhone,
      status: p.status,
      listingAgentId: p.agentId,
      agencyCommissionPercent: p.purpose === 'Rent' ? 100 : 1.0, // 1% for sale or 1 month for rent
      documents: [
        { name: 'Allotment Letter', status: docStatus1 as 'uploaded' },
        { name: 'Transfer Letter', status: docStatus2 as 'uploaded' | 'missing' },
        { name: 'Society NOC', status: docStatus3 as 'uploaded' | 'missing' },
        { name: 'Approved Building Plan', status: (idx % 2 === 0 ? 'uploaded' : 'missing') as 'uploaded' | 'missing' },
      ],
      images: [
        propertyImages[idx % propertyImages.length],
        propertyImages[(idx + 1) % propertyImages.length],
        propertyImages[(idx + 2) % propertyImages.length],
      ],
      listedDate: relativeDaysAgo(p.daysAgo),
      updatedAt: relativeDaysAgo(p.isStale ? p.daysAgo : Math.min(p.daysAgo, 7)),
      isFeatured: p.isFeatured || false,
      isPossibleDuplicate: p.isPossibleDuplicate || false,
      isSoldStillListed: p.isSoldStillListed || false,
      isStale: p.isStale || false,
      description: `Prime located ${p.type} in ${p.area}, ${p.blockPhase}. Built to highest standards with modern fittings, imported tiles, solid woodwork, and dedicated parking. Complete legal documentation vetted.`,
    });
  });

  // Expand up to 60 realistic properties
  const agents = ['usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-10'];
  const karachiAreas = [
    { area: 'DHA Phase 6', block: 'Khayaban-e-Muslim', type: 'House', size: 500, unit: 'sq yd', price: 125000000, bed: 5, bath: 6 },
    { area: 'DHA Phase 5', block: 'Khayaban-e-Tanzeem', type: 'Commercial Shop', size: 600, unit: 'sq ft', price: 42000000 },
    { area: 'DHA Phase 8', block: 'Creek Vistas', type: 'Apartment', size: 2800, unit: 'sq ft', price: 62000000, bed: 3, bath: 4 },
    { area: 'Clifton', block: 'Block 4 Marine Drive', type: 'Apartment', size: 3100, unit: 'sq ft', price: 79000000, bed: 4, bath: 5 },
    { area: 'Bahria Town Karachi', block: 'Precinct 19 Apartments', type: 'Apartment', size: 1400, unit: 'sq ft', price: 11500000, bed: 2, bath: 2 },
    { area: 'Bahria Town Karachi', block: 'Precinct 27', type: 'Plot', size: 500, unit: 'sq yd', price: 14500000 },
    { area: 'Gulshan-e-Iqbal', block: 'Block 13-D', type: 'Apartment', size: 1500, unit: 'sq ft', price: 18500000, bed: 3, bath: 3 },
    { area: 'PECHS', block: 'Block 2', type: 'House', size: 500, unit: 'sq yd', price: 82000000, bed: 5, bath: 5 },
    { area: 'Scheme 33', block: 'Gulshan-e-Kaneez Fatima', type: 'House', size: 200, unit: 'sq yd', price: 29000000, bed: 4, bath: 4 },
    { area: 'North Nazimabad', block: 'Block H', type: 'House', size: 400, unit: 'sq yd', price: 58000000, bed: 5, bath: 5 },
    { area: 'DHA Phase 2', block: 'Commercial Area A', type: 'Office', size: 1800, unit: 'sq ft', price: 340000, bed: 0, bath: 2, rent: true },
    { area: 'DHA Phase 6', block: 'Khayaban-e-Muhafiz', type: 'House', size: 1000, unit: 'sq yd', price: 240000000, bed: 6, bath: 7 },
    { area: 'Bahria Town Karachi', block: 'Precinct 11', type: 'House', size: 125, unit: 'sq yd', price: 17500000, bed: 3, bath: 3 },
    { area: 'Clifton', block: 'Block 7', type: 'House', size: 600, unit: 'sq yd', price: 145000000, bed: 5, bath: 6 },
  ];

  let currIdx = properties.length + 1;
  while (properties.length < 60) {
    const template = karachiAreas[currIdx % karachiAreas.length];
    const isRent = (template as any).rent || (currIdx % 7 === 0);
    const status: PropertyStatus = currIdx % 5 === 0 ? 'Sold' : (currIdx % 9 === 0 ? 'Under Offer' : (currIdx % 11 === 0 ? 'Rented' : 'Available'));
    const isStale = currIdx === 55; // 4th stale
    
    properties.push({
      id: `prop-${currIdx}`,
      propertyCode: `PK-DHA-0${140 + currIdx}`,
      title: `${template.size} ${template.unit} ${template.type} in ${template.area}`,
      purpose: isRent ? 'Rent' : 'Sale',
      type: template.type as PropertyType,
      city: 'Karachi',
      area: template.area,
      blockPhase: template.block,
      size: template.size,
      sizeUnit: template.unit as AreaUnit,
      price: isRent ? 350000 : template.price,
      bedrooms: template.bed,
      bathrooms: template.bath,
      ownerName: `Owner ${currIdx} Malik`,
      ownerPhone: `030${currIdx % 9}-${1000000 + currIdx * 342}`,
      status,
      listingAgentId: agents[currIdx % agents.length],
      agencyCommissionPercent: isRent ? 100 : 1.0,
      documents: [
        { name: 'Allotment Letter', status: 'uploaded' },
        { name: 'Transfer Letter', status: 'uploaded' },
        { name: 'Society NOC', status: 'uploaded' },
      ],
      images: [
        propertyImages[currIdx % propertyImages.length],
        propertyImages[(currIdx + 1) % propertyImages.length],
      ],
      listedDate: relativeDaysAgo(currIdx * 2),
      updatedAt: relativeDaysAgo(isStale ? currIdx * 2 : 5),
      isStale,
      description: `Well maintained ${template.type} situated in ${template.area}. Ideal for peaceful living or commercial viability. Ready for transfer.`,
    });
    currIdx++;
  }

  return properties;
}

export const INITIAL_PROPERTIES = generateInitialProperties();

