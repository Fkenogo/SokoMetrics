
export enum UserRole {
  ADMIN = 'ADMIN',
  CONTRIBUTOR = 'CONTRIBUTOR',
  B2B = 'B2B'
}

export enum SubscriptionTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold'
}

export enum Category {
  CONSTRUCTION = 'Construction Materials',
  AGRICULTURE = 'Agricultural Inputs'
}

export enum SubmissionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  FLAGGED = 'Flagged'
}

export enum StockStatus {
  IN_STOCK = 'In Stock',
  LOW = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock'
}

export enum ContributorType {
  FIELD_AGENT = 'Field Agent',
  TRADER = 'Trader/Supplier',
  SHOP_OWNER = 'Hardware Shop Owner',
  AGRO_DEALER = 'Agro-dealer',
  CONSUMER = 'Consumer/Individual Buyer',
  OTHER = 'Other'
}

export enum SupplierType {
  FACTORY_GATE = 'Factory Gate',
  WHOLESALER = 'Wholesaler',
  RETAIL_HARDWARE = 'Retail Hardware',
  AGRO_DEALER = 'Agro-dealer',
  MARKET_VENDOR = 'Market Vendor'
}

export interface Submission {
  id: string; // Submission_ID
  timestamp: string; // Submission_Timestamp
  productId: string;
  brandId: string;
  contributorId: string;
  contributorName: string;
  contributorType?: ContributorType;
  category: Category;
  subCategory: string; // Maps to Product_Type
  brand: string;
  spec1: string; // Specification_1 (Grade, Size, etc.)
  spec2?: string; // Specification_2 (Gauge, Coating, etc.)
  unit: string;
  priceLocal: number;
  currency: string;
  priceUSD: number;
  country: string;
  city: string;
  supplierName?: string;
  supplierType: SupplierType;
  stockAvailability: StockStatus;
  status: SubmissionStatus;
  isPriority?: boolean;
  deviationFromMedian?: number;
  medianReference?: number;
  flagReason?: string;
  adminComment?: string;
  hasPhoto: boolean;
  photoUrl?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  trustWeight: number; // 0.1 to 1.0
  pointsEarned: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  subscriptionTier?: SubscriptionTier;
  countries?: string[];
  expiryDate?: string;
  trustScore: number; // 0-100
  points: number; // Points_Balance
  totalPointsEarned: number;
  submissionsCount: number; // Total_Submissions
  approvedCount: number; // Approved_Submissions
  rejectionsCount: number;
  joinDate: string;
  lastActivity: string; // Last_Submission_Date
  status: 'Active' | 'Suspended' | 'Monitoring';
  rank: string; // Current_Level
  phone?: string;
  type: ContributorType;
  badges: Badge[];
  autoApproval: boolean;
  recentAccuracy?: number;
  avgDeviation?: number;
  recentIssues?: ContributorIssue[];
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Reward {
  id: string;
  label: string;
  cost: number;
  provider: string;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  submissions: number;
  rank: number;
}

export interface ContributorIssue {
  id: string;
  description: string;
  date: string;
}

export interface PriceMovement {
  id: string;
  product: string;
  market: string;
  change: number;
  currentPrice: number;
  previousPrice: number;
  currency: string;
  reason: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ArbitrageOpportunity {
  id: string;
  product: string;
  buyMarket: string;
  buyPriceUSD: number;
  sellMarket: string;
  sellPriceUSD: number;
  spread: number;
  considerations: string[];
}

export interface B2BAlert {
  id: string;
  product: string;
  trigger: string;
  method: string[];
  active: boolean;
}

export interface MedianCache {
  productId: string;
  brandId: string;
  spec: string;
  city: string;
  country: string;
  medianLocal: number;
  medianUSD: number;
  min: number;
  max: number;
  sampleSize: number;
  volatility: number; // %
  lastUpdated: string;
}
