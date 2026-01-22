
import { 
  Category, StockStatus, SubmissionStatus, UserRole, User, Submission, 
  Reward, LeaderboardEntry, ContributorType, SubscriptionTier, 
  PriceMovement, ArbitrageOpportunity, B2BAlert, SupplierType 
} from './types';

export const REGIONS = {
  'Rwanda': ['Kigali', 'Gisenyi', 'Musanze', 'Butare', 'Rwamagana'],
  'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  'Tanzania': ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza'],
  'Burundi': ['Bujumbura', 'Gitega', 'Ngozi']
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  'Rwanda': 'RWF',
  'Uganda': 'UGX',
  'Kenya': 'KES',
  'Tanzania': 'TZS',
  'Burundi': 'BIF'
};

export const CURRENCIES = ['RWF', 'UGX', 'KES', 'TZS', 'BIF', 'USD'];

export const PRODUCT_HIERARCHY: Record<string, any> = {
  [Category.CONSTRUCTION]: {
    'Cement': {
      id: 'P001',
      brands: [
        { id: 'B001', name: 'Bamburi (Blue Triangle)', manufacturer: 'Holcim', specs: ['32.5N', '32.5R', '42.5N', '42.5R'] },
        { id: 'B002', name: 'Simba Cement', manufacturer: 'Simba', specs: ['32.5R', '42.5N'] },
        { id: 'B003', name: 'CIMERWA', manufacturer: 'Cimerwa PPC', specs: ['32.5N', '42.5N'] },
        { id: 'B008', name: 'Dangote Cement', manufacturer: 'Dangote', specs: ['32.5R', '42.5N', '42.5R'] },
      ],
      detailsLabel: 'Grade',
      unit: '50kg bag'
    },
    'Steel': {
      id: 'P002',
      brands: [
        { id: 'B004', name: 'Devki TMT', manufacturer: 'Devki Group', specs: ['8mm', '10mm', '12mm', '16mm'] },
        { id: 'B005', name: 'Tononoka Steel', manufacturer: 'Tononoka', specs: ['8mm', '10mm', '12mm'] },
        { id: 'B009', name: 'Prime Steel', manufacturer: 'Prime', specs: ['8mm', '12mm'] },
      ],
      detailsLabel: 'Diameter',
      unit: 'Per Piece (12m)'
    },
    'Roofing': {
      id: 'P003',
      brands: [
        { id: 'B006', name: 'MRM Mabati', manufacturer: 'Safal Group', specs: ['G28', 'G30', 'G32'] },
        { id: 'B010', name: 'Royal Mabati', manufacturer: 'Royal', specs: ['G28', 'G30'] },
      ],
      detailsLabel: 'Gauge',
      unit: 'Per Linear Meter'
    }
  },
  [Category.AGRICULTURE]: {
    'Fertilizers': {
      id: 'P004',
      brands: [
        { id: 'B007', name: 'YaraMila', manufacturer: 'Yara', specs: ['DAP', 'Urea', 'NPK', 'CAN'] },
        { id: 'B011', name: 'ETG Fertilizer', manufacturer: 'ETG', specs: ['DAP', 'NPK'] },
      ],
      detailsLabel: 'Type',
      unit: '50kg bag'
    },
    'Seeds': {
      id: 'P005',
      brands: [
        { id: 'B012', name: 'Kenya Seed Co', manufacturer: 'KSC', specs: ['Maize H614', 'Maize H6213'] },
        { id: 'B013', name: 'Pannar', manufacturer: 'Corteva', specs: ['Maize PAN 691', 'Maize PAN 12'] },
      ],
      detailsLabel: 'Variety',
      unit: '2kg packet'
    }
  }
};

export const MOCK_PRICE_MOVEMENTS: PriceMovement[] = [
  { id: 'pm1', product: 'Bamburi Cement 32.5R', market: 'Kigali, Rwanda', change: 5.2, currentPrice: 18800, previousPrice: 17850, currency: 'RWF', reason: 'Supply chain disruptions', trend: 'up' },
  { id: 'pm2', product: 'Devki Steel 10mm', market: 'Kampala, Uganda', change: -3.1, currentPrice: 13500, previousPrice: 13950, currency: 'UGX', reason: 'Increased imports', trend: 'down' },
  { id: 'pm3', product: 'YaraMila DAP', market: 'Bujumbura, Burundi', change: 8.7, currentPrice: 54500, previousPrice: 50150, currency: 'BIF', reason: 'Currency depreciation, import costs', trend: 'up' },
  { id: 'pm4', product: 'CIMERWA 42.5N', market: 'Musanze, Rwanda', change: 1.2, currentPrice: 14500, previousPrice: 14320, currency: 'RWF', reason: 'Stable regional demand', trend: 'stable' },
];

export const MOCK_ARBITRAGE: ArbitrageOpportunity[] = [
  { 
    id: 'a1', product: 'Steel Rebar 10mm', buyMarket: 'Kampala, Uganda', buyPriceUSD: 3.58, 
    sellMarket: 'Kigali, Rwanda', sellPriceUSD: 5.89, spread: 64, 
    considerations: ['Transport cost ~$0.80/piece', 'Import duties 10%'] 
  },
  { 
    id: 'a2', product: 'YaraMila DAP Fertilizer', buyMarket: 'Mombasa, Kenya', buyPriceUSD: 32.50, 
    sellMarket: 'Kampala, Uganda', sellPriceUSD: 48.20, spread: 48, 
    considerations: ['Port clearance delays', 'Last-mile logistics in Central Uganda'] 
  },
];

export const MOCK_B2B_ALERTS: B2BAlert[] = [
  { id: 'al1', product: 'Cement - Bamburi 32.5R (Kigali)', trigger: 'Price drops below RWF 17,500', method: ['Email', 'SMS'], active: true },
  { id: 'al2', product: 'Steel - Devki 12mm (Nairobi)', trigger: 'Volatility > 5% Weekly', method: ['WhatsApp'], active: false },
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'r1', label: 'RWF 2,500 Discount', cost: 1250, provider: 'Kigali Hardware', icon: 'fa-ticket-simple' },
  { id: 'r2', label: 'Free Soil Test Voucher', cost: 3000, provider: 'AgriCare Labs', icon: 'fa-microscope' },
  { id: 'r3', label: 'UGX 10,000 Airtime', cost: 800, provider: 'MTN Uganda', icon: 'fa-mobile-screen-button' },
];

export const MOCK_WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'l1', name: 'BuilderJohn', points: 850, submissions: 112, rank: 1 },
  { id: 'l2', name: 'AgriPro_Entebbe', points: 720, submissions: 85, rank: 2 },
  { id: 'l3', name: 'KigaliTrader_01', points: 640, submissions: 42, rank: 3 },
  { id: 'l4', name: 'SteelWatch_Ke', points: 510, submissions: 30, rank: 4 },
];

export const MOCK_USER: User = {
  id: 'C045',
  name: 'John Contributor',
  role: UserRole.CONTRIBUTOR,
  trustScore: 82,
  points: 1250,
  totalPointsEarned: 24320,
  submissionsCount: 1856,
  approvedCount: 1798,
  rejectionsCount: 3,
  joinDate: '2025-03-15',
  lastActivity: '10 mins ago',
  status: 'Active',
  rank: 'Gold',
  type: ContributorType.TRADER,
  autoApproval: true,
  badges: [
    { id: 'b1', label: 'Verified Expert', icon: 'fa-certificate', color: 'text-indigo-600', description: 'Consistently provides accurate regional data.' },
    { id: 'b2', label: 'Early Adopter', icon: 'fa-rocket', color: 'text-emerald-600', description: 'One of the first 100 regional scouts.' },
    { id: 'b3', label: 'Price Watcher', icon: 'fa-eye', color: 'text-amber-500', description: 'Logged over 50 submissions in a single market.' },
  ]
};

export const MOCK_ADMIN: User = {
  id: 'adm1',
  name: 'Alice Admin',
  role: UserRole.ADMIN,
  trustScore: 100,
  points: 0,
  totalPointsEarned: 0,
  submissionsCount: 0,
  approvedCount: 0,
  rejectionsCount: 0,
  joinDate: '2024-01-01',
  lastActivity: 'Now',
  status: 'Active',
  rank: 'Admin',
  type: ContributorType.OTHER,
  autoApproval: true,
  badges: []
};

export const MOCK_B2B: User = {
  id: 'b2b1',
  name: 'ABC Construction Ltd',
  role: UserRole.B2B,
  subscriptionTier: SubscriptionTier.SILVER,
  countries: ['Rwanda', 'Uganda', 'Kenya'],
  expiryDate: '2026-06-30',
  trustScore: 0,
  points: 0,
  totalPointsEarned: 0,
  submissionsCount: 0,
  approvedCount: 0,
  rejectionsCount: 0,
  joinDate: '2025-05-01',
  lastActivity: '1 day ago',
  status: 'Active',
  rank: 'Subscriber',
  type: ContributorType.OTHER,
  autoApproval: false,
  badges: []
};

export const MOCK_CONTRIBUTORS_DETAILED: User[] = [
  {
    ...MOCK_USER,
    id: 'C045',
    name: 'BuilderJohn',
    recentAccuracy: 96,
    avgDeviation: 2.3
  },
  {
    id: 'c2',
    name: 'NewUser_2024',
    trustScore: 30,
    rank: 'Bronze',
    role: UserRole.CONTRIBUTOR,
    points: 150,
    totalPointsEarned: 150,
    type: ContributorType.CONSUMER,
    submissionsCount: 5,
    approvedCount: 3,
    rejectionsCount: 2,
    joinDate: '2026-01-20',
    lastActivity: '1 day ago',
    status: 'Monitoring',
    autoApproval: false,
    avgDeviation: 15.4,
    recentAccuracy: 60,
    recentIssues: [
      { id: 'i1', description: 'Submission #1547: Flagged for low price, no photo', date: '2026-01-22' },
    ],
    badges: []
  },
  {
    id: 'c3',
    name: 'KampalaSteelExpert',
    trustScore: 94,
    rank: 'Platinum',
    role: UserRole.CONTRIBUTOR,
    points: 5200,
    totalPointsEarned: 8500,
    type: ContributorType.FIELD_AGENT,
    submissionsCount: 420,
    approvedCount: 415,
    rejectionsCount: 1,
    joinDate: '2024-11-12',
    lastActivity: '2 hours ago',
    status: 'Active',
    autoApproval: true,
    avgDeviation: 1.1,
    recentAccuracy: 99,
    badges: []
  },
  {
    id: 'c4',
    name: 'NairobiAgriDeals',
    trustScore: 78,
    rank: 'Silver',
    role: UserRole.CONTRIBUTOR,
    points: 1850,
    totalPointsEarned: 3200,
    type: ContributorType.AGRO_DEALER,
    submissionsCount: 125,
    approvedCount: 110,
    rejectionsCount: 5,
    joinDate: '2025-02-05',
    lastActivity: '4 days ago',
    status: 'Active',
    autoApproval: true,
    avgDeviation: 4.8,
    recentAccuracy: 88,
    badges: []
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'S1547',
    productId: 'P001',
    brandId: 'B001',
    contributorId: 'C045',
    contributorName: 'BuilderJohn',
    category: Category.CONSTRUCTION,
    subCategory: 'Cement',
    brand: 'Bamburi (Blue Triangle)',
    spec1: '32.5R',
    unit: '50kg bag',
    priceLocal: 18500,
    currency: 'RWF',
    priceUSD: 13.28,
    country: 'Rwanda',
    city: 'Kigali',
    supplierName: 'Kigali Hardware Center',
    supplierType: SupplierType.RETAIL_HARDWARE,
    stockAvailability: StockStatus.IN_STOCK,
    timestamp: '2026-01-22T14:35:00Z',
    status: SubmissionStatus.APPROVED,
    hasPhoto: true,
    latitude: -1.9450,
    longitude: 30.1055,
    trustWeight: 0.92,
    pointsEarned: 15,
    deviationFromMedian: 1.6,
    medianReference: 18200
  },
  {
    id: 'S1548',
    productId: 'P001',
    brandId: 'B001',
    contributorId: 'c2',
    contributorName: 'NewUser_2024',
    category: Category.CONSTRUCTION,
    subCategory: 'Cement',
    brand: 'Bamburi (Blue Triangle)',
    spec1: '32.5R',
    unit: '50kg bag',
    priceLocal: 12000,
    currency: 'RWF',
    priceUSD: 8.61,
    country: 'Rwanda',
    city: 'Kigali',
    supplierName: 'Random Market Stand',
    supplierType: SupplierType.MARKET_VENDOR,
    stockAvailability: StockStatus.LOW,
    timestamp: '2026-01-23T09:12:00Z',
    status: SubmissionStatus.FLAGGED,
    hasPhoto: false,
    latitude: -1.9441,
    longitude: 30.0619,
    trustWeight: 0.30,
    pointsEarned: 0,
    deviationFromMedian: -34.1,
    medianReference: 18200,
    flagReason: 'Price Outlier (-34%)'
  },
  {
    id: 'S1549',
    productId: 'P002',
    brandId: 'B004',
    contributorId: 'c3',
    contributorName: 'KampalaSteelExpert',
    category: Category.CONSTRUCTION,
    subCategory: 'Steel',
    brand: 'Devki TMT',
    spec1: '12mm',
    unit: 'Per Piece (12m)',
    priceLocal: 42000,
    currency: 'UGX',
    priceUSD: 11.12,
    country: 'Uganda',
    city: 'Kampala',
    supplierName: 'Kampala Steel Depot',
    supplierType: SupplierType.WHOLESALER,
    stockAvailability: StockStatus.IN_STOCK,
    timestamp: '2026-01-22T16:00:00Z',
    status: SubmissionStatus.APPROVED,
    hasPhoto: true,
    latitude: 0.3476,
    longitude: 32.5825,
    trustWeight: 0.94,
    pointsEarned: 25,
    deviationFromMedian: -0.5,
    medianReference: 42200
  },
  {
    id: 'S1550',
    productId: 'P004',
    brandId: 'B007',
    contributorId: 'c4',
    contributorName: 'NairobiAgriDeals',
    category: Category.AGRICULTURE,
    subCategory: 'Fertilizers',
    brand: 'YaraMila',
    spec1: 'DAP',
    unit: '50kg bag',
    priceLocal: 4800,
    currency: 'KES',
    priceUSD: 36.92,
    country: 'Kenya',
    city: 'Nairobi',
    supplierName: 'Global Agri Input Ltd',
    supplierType: SupplierType.AGRO_DEALER,
    stockAvailability: StockStatus.IN_STOCK,
    timestamp: '2026-01-21T11:00:00Z',
    status: SubmissionStatus.APPROVED,
    hasPhoto: true,
    latitude: -1.2921,
    longitude: 36.8219,
    trustWeight: 0.78,
    pointsEarned: 20,
    deviationFromMedian: 2.1,
    medianReference: 4700
  },
  {
    id: 'S1551',
    productId: 'P001',
    brandId: 'B003',
    contributorId: 'C045',
    contributorName: 'BuilderJohn',
    category: Category.CONSTRUCTION,
    subCategory: 'Cement',
    brand: 'CIMERWA',
    spec1: '42.5N',
    unit: '50kg bag',
    priceLocal: 14800,
    currency: 'RWF',
    priceUSD: 10.62,
    country: 'Rwanda',
    city: 'Gisenyi',
    supplierName: 'Lake View Hardware',
    supplierType: SupplierType.RETAIL_HARDWARE,
    stockAvailability: StockStatus.IN_STOCK,
    timestamp: '2026-01-22T10:15:00Z',
    status: SubmissionStatus.APPROVED,
    hasPhoto: true,
    latitude: -1.7019,
    longitude: 29.2558,
    trustWeight: 0.85,
    pointsEarned: 15,
    deviationFromMedian: 0.8,
    medianReference: 14680
  }
];
