export type UserRole = 'Owner' | 'Manager' | 'Agent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  active: boolean;
  joinedDate: string;
  targetMonthlySales: number;
  targetMonthlyCommission: number;
  responseTimeHours?: number;
}

export type LeadSource = 'Zameen' | 'Facebook' | 'Instagram' | 'WhatsApp' | 'Phone' | 'Walk-in' | 'Referral';
export type LeadInterest = 'Buy' | 'Rent' | 'Sell' | 'Invest';
export type PropertyType = 'House' | 'Apartment' | 'Plot' | 'Commercial Shop' | 'Office' | 'Farmhouse';
export type LeadTemperature = 'Hot' | 'Warm' | 'Cold';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Visit Scheduled' | 'Visit Done' | 'Negotiation' | 'Won' | 'Lost';

export interface ActivityItem {
  id: string;
  type: 'Call' | 'WhatsApp' | 'Meeting' | 'Note' | 'StatusChange' | 'Visit';
  description: string;
  outcome?: string;
  createdAt: string;
  authorName: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  interest: LeadInterest;
  propertyType: PropertyType;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  assignedAgentId?: string;
  temperature: LeadTemperature;
  status: LeadStatus;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  isDuplicate?: boolean;
  duplicateOfLeadId?: string;
  isLocked?: boolean;
  claimedByManagerId?: string;
  claimedByManagerName?: string;
  lockedAt?: string;
  activities: ActivityItem[];
}

export type PropertyPurpose = 'Sale' | 'Rent';
export type AreaUnit = 'sq yd' | 'sq ft' | 'Marla' | 'Kanal';
export type PropertyStatus = 'Available' | 'Under Offer' | 'Sold' | 'Rented' | 'Off Market';

export interface PropertyDocument {
  name: string;
  status: 'uploaded' | 'missing';
}

export interface Property {
  id: string;
  propertyCode: string;
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
  listingAgentId: string;
  agencyCommissionPercent: number;
  documents: PropertyDocument[];
  images: string[];
  listedDate: string;
  updatedAt: string;
  description?: string;
  isPossibleDuplicate?: boolean;
  isSoldStillListed?: boolean;
  isStale?: boolean;
  isFeatured?: boolean;
}

export type ClientType = 'Buyer' | 'Seller' | 'Landlord' | 'Tenant' | 'Investor';
export type ClientTag = 'VIP' | 'Overseas Pakistani' | 'Repeat client';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnic: string;
  city: string;
  types: ClientType[];
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  preferredPropertyType: PropertyType[];
  assignedAgentId: string;
  linkedPropertyIds: string[];
  linkedDealIds: string[];
  tags: ClientTag[];
  notes?: string;
  createdAt: string;
}

export type DealStage = 'Negotiation' | 'Token Received' | 'Agreement Signed' | 'Transfer in Process' | 'Closed Won' | 'Closed Lost';

export interface DealPaymentMilestone {
  id: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid';
}

export interface DealCommissionSplit {
  buyerCommissionPercent: number;
  sellerCommissionPercent: number;
  totalAgencyCommission: number;
  agentSharePercent: number;
  agentShareAmount: number;
  referralSharePercent: number;
  referralShareAmount: number;
  agencyNetProfit: number;
  isLocked: boolean;
  lockedBy: string;
  lockedAt: string;
}

export interface DealStageHistory {
  stage: DealStage;
  date: string;
  updatedBy: string;
  note?: string;
}

export interface Deal {
  id: string;
  dealCode: string;
  title: string;
  propertyId: string;
  buyerClientId: string;
  sellerClientId: string;
  listingAgentId: string;
  sellingAgentId: string;
  referralPartnerName?: string;
  dealValue: number;
  tokenAmount: number;
  tokenDate?: string;
  stage: DealStage;
  daysInStage: number;
  stageUpdatedAt: string;
  createdAt: string;
  paymentSchedule: DealPaymentMilestone[];
  commissionSplit: DealCommissionSplit;
  notes?: string;
  stageHistory: DealStageHistory[];
}

export type VisitStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
export type VisitFeedback = 'Interested' | 'Not interested' | 'Wants second visit' | 'Price issue' | 'Location issue';

export interface SiteVisit {
  id: string;
  clientId: string;
  propertyId: string;
  agentId: string;
  date: string;
  time: string;
  status: VisitStatus;
  pickupRequired: boolean;
  feedback?: VisitFeedback;
  feedbackNotes?: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export type TaskType = 'Call back' | 'WhatsApp' | 'Send documents' | 'Visit follow-up' | 'Payment follow-up';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  linkedLeadId?: string;
  linkedClientId?: string;
  linkedDealId?: string;
  agentId: string;
  dueDateTime: string;
  priority: TaskPriority;
  status: 'Pending' | 'Completed';
  outcomeNote?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CommissionEntry {
  id: string;
  dealId: string;
  propertyTitle: string;
  dealValue: number;
  totalAgencyCommission: number;
  agentId: string;
  agentName: string;
  agentShare: number;
  referralPartner?: string;
  referralShare?: number;
  agencyNet: number;
  status: 'Pending' | 'Partially Received' | 'Received';
  receivedAmount: number;
  balance: number;
  agentPayoutStatus: 'Pending' | 'Paid';
  agentPayoutAmount: number;
  createdAt: string;
  lastPaymentDate?: string;
}

export type ExpenseCategory = 'Office rent' | 'Salaries' | 'Marketing — Zameen package' | 'Facebook ads' | 'Fuel' | 'Utilities' | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note?: string;
}

export interface WhatsAppRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: 'English' | 'Roman Urdu';
  status: 'Approved' | 'Pending approval';
  body: string;
}

export interface WhatsAppLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  templateName: string;
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  record: string;
  ipAddress: string;
  isSuspicious?: boolean;
  suspiciousReason?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
  link?: string;
}

