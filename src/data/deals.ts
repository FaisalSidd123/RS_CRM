import { Deal, DealStage } from '@/types';
import { relativeDaysAgo } from './seedGenerator';
import { calculateCommission } from '@/lib/commission';

interface RawDealSeed {
  id: string;
  code: string;
  title: string;
  propId: string;
  buyerId: string;
  sellerId: string;
  agentId: string;
  val: number;
  token: number;
  stage: DealStage;
  daysInStage: number;
  monthsAgo: number;
}

const rawDealData: RawDealSeed[] = [
  // 12 Closed Won deals spread over last 6 months to populate charts
  { id: 'deal-1', code: 'D-1001', title: '500 Sq Yd DHA Phase 6 Luxury Villa', propId: 'prop-6', buyerId: 'client-1', sellerId: 'client-2', agentId: 'usr-3', val: 88000000, token: 5000000, stage: 'Closed Won', daysInStage: 4, monthsAgo: 5 },
  { id: 'deal-2', code: 'D-1002', title: '125 Sq Yd Bahria Precinct 10 Plot', propId: 'prop-12', buyerId: 'client-3', sellerId: 'client-4', agentId: 'usr-4', val: 7200000, token: 1000000, stage: 'Closed Won', daysInStage: 2, monthsAgo: 5 },
  { id: 'deal-3', code: 'D-1003', title: '240 Sq Yd North Nazimabad Bungalow', propId: 'prop-19', buyerId: 'client-5', sellerId: 'client-6', agentId: 'usr-4', val: 39000000, token: 3000000, stage: 'Closed Won', daysInStage: 5, monthsAgo: 4 },
  { id: 'deal-4', code: 'D-1004', title: '10 Marla Safari Villas Bahria Lahore', propId: 'prop-24', buyerId: 'client-7', sellerId: 'client-8', agentId: 'usr-7', val: 38000000, token: 3000000, stage: 'Closed Won', daysInStage: 3, monthsAgo: 4 },
  { id: 'deal-5', code: 'D-1005', title: '10 Marla DHA Phase 2 Islamabad House', propId: 'prop-31', buyerId: 'client-9', sellerId: 'client-10', agentId: 'usr-3', val: 61000000, token: 5000000, stage: 'Closed Won', daysInStage: 8, monthsAgo: 3 },
  { id: 'deal-6', code: 'D-1006', title: '3-Bed Clifton Apartment Block 4', propId: 'prop-4', buyerId: 'client-11', sellerId: 'client-12', agentId: 'usr-3', val: 46000000, token: 4000000, stage: 'Closed Won', daysInStage: 6, monthsAgo: 3 },
  { id: 'deal-7', code: 'D-1007', title: '200 Sq Yd Spanish Bungalow DHA Phase 2', propId: 'prop-7', buyerId: 'client-13', sellerId: 'client-14', agentId: 'usr-5', val: 62000000, token: 5000000, stage: 'Closed Won', daysInStage: 12, monthsAgo: 2 },
  { id: 'deal-8', code: 'D-1008', title: '1 Kanal DHA 5 Lahore Spanish Villa', propId: 'prop-21', buyerId: 'client-15', sellerId: 'client-16', agentId: 'usr-3', val: 95000000, token: 8000000, stage: 'Closed Won', daysInStage: 7, monthsAgo: 2 },
  { id: 'deal-9', code: 'D-1009', title: '120 Sq Yd Bahria Precinct 1 Villa', propId: 'prop-11', buyerId: 'client-17', sellerId: 'client-18', agentId: 'usr-4', val: 16000000, token: 2000000, stage: 'Closed Won', daysInStage: 9, monthsAgo: 1 },
  { id: 'deal-10', code: 'D-1010', title: '3-Bed Sea-Facing Clifton Apartment', propId: 'prop-4', buyerId: 'client-19', sellerId: 'client-20', agentId: 'usr-6', val: 47500000, token: 4500000, stage: 'Closed Won', daysInStage: 11, monthsAgo: 1 },
  { id: 'deal-11', code: 'D-1011', title: '500 Sq Yd DHA Phase 6 Designer Home', propId: 'prop-1', buyerId: 'client-21', sellerId: 'client-22', agentId: 'usr-3', val: 132000000, token: 10000000, stage: 'Closed Won', daysInStage: 3, monthsAgo: 0 },
  { id: 'deal-12', code: 'D-1012', title: '1000 Sq Yd Ambassadorial Mansion DHA 8', propId: 'prop-3', buyerId: 'client-23', sellerId: 'client-24', agentId: 'usr-3', val: 275000000, token: 25000000, stage: 'Closed Won', daysInStage: 2, monthsAgo: 0 },

  // Deals currently in pipeline
  // 2 stuck in Token stage > 14 days (Needs attention alert)
  { id: 'deal-13', code: 'D-1013', title: '500 Sq Yd Modern House Khayaban-e-Bukhari', propId: 'prop-2', buyerId: 'client-25', sellerId: 'client-26', agentId: 'usr-5', val: 142000000, token: 10000000, stage: 'Token Received', daysInStage: 19, monthsAgo: 0 },
  { id: 'deal-14', code: 'D-1014', title: '1000 Sq Yd Commercial Plot Shahrah-e-Faisal', propId: 'prop-18', buyerId: 'client-27', sellerId: 'client-28', agentId: 'usr-5', val: 320000000, token: 20000000, stage: 'Token Received', daysInStage: 22, monthsAgo: 0 },
  
  // Other pipeline deals
  { id: 'deal-15', code: 'D-1015', title: '10 Marla Near Commercial Broadway DHA 5 LHR', propId: 'prop-22', buyerId: 'client-29', sellerId: 'client-30', agentId: 'usr-4', val: 54000000, token: 4000000, stage: 'Agreement Signed', daysInStage: 8, monthsAgo: 0 },
  { id: 'deal-16', code: 'D-1016', title: '500 Sq Yd Classical Diplomatic F-7/2', propId: 'prop-27', buyerId: 'client-31', sellerId: 'client-32', agentId: 'usr-3', val: 195000000, token: 15000000, stage: 'Transfer in Process', daysInStage: 6, monthsAgo: 0 },
  { id: 'deal-17', code: 'D-1017', title: '500 Sq Yd Luxury Golf View Villa BTK', propId: 'prop-13', buyerId: 'client-33', sellerId: 'client-34', agentId: 'usr-4', val: 52000000, token: 3000000, stage: 'Negotiation', daysInStage: 4, monthsAgo: 0 },
  { id: 'deal-18', code: 'D-1018', title: '4-Bed Penthouse Clifton Block 5', propId: 'prop-8', buyerId: 'client-35', sellerId: 'client-36', agentId: 'usr-7', val: 85000000, token: 5000000, stage: 'Negotiation', daysInStage: 9, monthsAgo: 0 },
  { id: 'deal-19', code: 'D-1019', title: '3-Bed Saima Luxury Towers Jauhar', propId: 'prop-20', buyerId: 'client-37', sellerId: 'client-38', agentId: 'usr-8', val: 21000000, token: 1500000, stage: 'Token Received', daysInStage: 5, monthsAgo: 0 },
  { id: 'deal-20', code: 'D-1020', title: '2 Kanal DHA Phase 6 Lahore Villa', propId: 'prop-23', buyerId: 'client-39', sellerId: 'client-40', agentId: 'usr-3', val: 210000000, token: 15000000, stage: 'Agreement Signed', daysInStage: 11, monthsAgo: 0 },
  { id: 'deal-21', code: 'D-1021', title: '500 Sq Yd Commercial Plot DHA 8 Zone C', propId: 'prop-9', buyerId: 'client-41', sellerId: 'client-42', agentId: 'usr-6', val: 180000000, token: 12000000, stage: 'Transfer in Process', daysInStage: 13, monthsAgo: 0 },
  { id: 'deal-22', code: 'D-1022', title: '240 Sq Yd Scheme 33 Single Storey', propId: 'prop-15', buyerId: 'client-43', sellerId: 'client-44', agentId: 'usr-5', val: 24000000, token: 2000000, stage: 'Closed Lost', daysInStage: 15, monthsAgo: 1 },
];

export function generateInitialDeals(): Deal[] {
  return rawDealData.map((d) => {
    const daysAgo = d.monthsAgo * 30 + d.daysInStage;
    const calc = calculateCommission({
      dealValue: d.val,
      buyerCommissionPercent: 1.0,
      sellerCommissionPercent: 1.0,
      agentSharePercent: 40,
      referralSharePercent: d.id === 'deal-11' || d.id === 'deal-16' ? 10 : 0,
    });

    const isLocked = true;
    const lockedBy = 'Imran Qureshi (Owner)';
    const lockedAt = relativeDaysAgo(daysAgo);

    return {
      id: d.id,
      dealCode: d.code,
      title: d.title,
      propertyId: d.propId,
      buyerClientId: d.buyerId,
      sellerClientId: d.sellerId,
      listingAgentId: d.agentId,
      sellingAgentId: d.agentId,
      referralPartnerName: d.id === 'deal-11' ? 'Apex Overseas Partners UK' : undefined,
      dealValue: d.val,
      tokenAmount: d.token,
      tokenDate: relativeDaysAgo(daysAgo),
      stage: d.stage,
      daysInStage: d.daysInStage,
      stageUpdatedAt: relativeDaysAgo(d.daysInStage),
      createdAt: relativeDaysAgo(daysAgo),
      paymentSchedule: [
        { id: `mil-${d.id}-1`, milestone: 'Token (Bayana) Payment', amount: d.token, dueDate: relativeDaysAgo(daysAgo), status: 'Paid' },
        { id: `mil-${d.id}-2`, milestone: 'Agreement Signing (Part Payment)', amount: Math.round(d.val * 0.2), dueDate: relativeDaysAgo(Math.max(1, daysAgo - 15)), status: d.stage === 'Closed Won' || d.stage === 'Transfer in Process' ? 'Paid' : 'Pending' },
        { id: `mil-${d.id}-3`, milestone: 'Final Balance at Transfer', amount: d.val - d.token - Math.round(d.val * 0.2), dueDate: relativeDaysAgo(Math.max(0, daysAgo - 30)), status: d.stage === 'Closed Won' ? 'Paid' : 'Pending' },
      ],
      commissionSplit: {
        buyerCommissionPercent: 1.0,
        sellerCommissionPercent: 1.0,
        totalAgencyCommission: calc.totalAgencyCommission,
        agentSharePercent: 40,
        agentShareAmount: calc.agentShareAmount,
        referralSharePercent: calc.referralShareAmount > 0 ? 10 : 0,
        referralShareAmount: calc.referralShareAmount,
        agencyNetProfit: calc.agencyNetProfit,
        isLocked,
        lockedBy,
        lockedAt,
      },
      notes: d.daysInStage > 14 && d.stage === 'Token Received'
        ? 'ALERT: Token was received over 14 days ago. Seller is delaying original file verification at society office. Immediate follow-up required.'
        : 'Deal terms mutually signed. Commission split locked at 1% buyer + 1% seller.',
      stageHistory: [
        { stage: 'Negotiation', date: relativeDaysAgo(daysAgo + 7), updatedBy: 'Imran Qureshi', note: 'Offer accepted by owner.' },
        { stage: 'Token Received', date: relativeDaysAgo(daysAgo), updatedBy: 'Imran Qureshi', note: `Token of ${d.token.toLocaleString()} received via pay order.` },
      ],
    };
  });
}

export const INITIAL_DEALS = generateInitialDeals();

