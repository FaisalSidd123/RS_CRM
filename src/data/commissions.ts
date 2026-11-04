import { CommissionEntry } from '@/types';
import { INITIAL_DEALS } from './deals';
import { INITIAL_USERS } from './users';
import { relativeDaysAgo } from './seedGenerator';

export function generateInitialCommissions(): CommissionEntry[] {
  const usersMap: Record<string, string> = {};
  INITIAL_USERS.forEach((u) => { usersMap[u.id] = u.name; });

  return INITIAL_DEALS.filter((d) => d.stage === 'Closed Won' || d.stage === 'Transfer in Process').map((deal, idx) => {
    const isClosed = deal.stage === 'Closed Won';
    const totalAgencyCommission = deal.commissionSplit.totalAgencyCommission;
    const agentShare = deal.commissionSplit.agentShareAmount;
    const referralShare = deal.commissionSplit.referralShareAmount;
    const agencyNet = deal.commissionSplit.agencyNetProfit;

    let status: 'Pending' | 'Partially Received' | 'Received' = 'Received';
    let receivedAmount = totalAgencyCommission;
    let agentPayoutStatus: 'Pending' | 'Paid' = 'Paid';

    if (!isClosed) {
      status = 'Partially Received';
      receivedAmount = Math.round(totalAgencyCommission * 0.5);
      agentPayoutStatus = 'Pending';
    } else if (idx === 0) {
      // Recent closed won deal with payout pending
      agentPayoutStatus = 'Pending';
    } else if (idx === 1) {
      status = 'Partially Received';
      receivedAmount = Math.round(totalAgencyCommission * 0.7);
      agentPayoutStatus = 'Pending';
    }

    const balance = totalAgencyCommission - receivedAmount;
    const agentPayoutAmount = agentPayoutStatus === 'Paid' ? agentShare : 0;

    return {
      id: `comm-${idx + 1}`,
      dealId: deal.id,
      propertyTitle: deal.title,
      dealValue: deal.dealValue,
      totalAgencyCommission,
      agentId: deal.sellingAgentId,
      agentName: usersMap[deal.sellingAgentId] || 'Agent',
      agentShare,
      referralPartner: deal.referralPartnerName,
      referralShare,
      agencyNet,
      status,
      receivedAmount,
      balance,
      agentPayoutStatus,
      agentPayoutAmount,
      createdAt: deal.createdAt,
      lastPaymentDate: relativeDaysAgo(Math.max(1, idx * 8)),
    };
  });
}

export const INITIAL_COMMISSIONS = generateInitialCommissions();

