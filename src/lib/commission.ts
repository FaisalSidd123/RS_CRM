export interface CommissionCalculationInput {
  dealValue: number;
  buyerCommissionPercent: number;
  sellerCommissionPercent: number;
  agentSharePercent: number;
  referralSharePercent?: number;
}

export interface CommissionCalculationResult {
  buyerCommissionAmount: number;
  sellerCommissionAmount: number;
  totalAgencyCommission: number;
  agentShareAmount: number;
  referralShareAmount: number;
  agencyNetProfit: number;
}

export function calculateCommission({
  dealValue,
  buyerCommissionPercent,
  sellerCommissionPercent,
  agentSharePercent,
  referralSharePercent = 0,
}: CommissionCalculationInput): CommissionCalculationResult {
  const buyerCommissionAmount = Math.round((dealValue * buyerCommissionPercent) / 100);
  const sellerCommissionAmount = Math.round((dealValue * sellerCommissionPercent) / 100);
  const totalAgencyCommission = buyerCommissionAmount + sellerCommissionAmount;
  
  const agentShareAmount = Math.round((totalAgencyCommission * agentSharePercent) / 100);
  const referralShareAmount = Math.round((totalAgencyCommission * referralSharePercent) / 100);
  const agencyNetProfit = totalAgencyCommission - agentShareAmount - referralShareAmount;

  return {
    buyerCommissionAmount,
    sellerCommissionAmount,
    totalAgencyCommission,
    agentShareAmount,
    referralShareAmount,
    agencyNetProfit,
  };
}

