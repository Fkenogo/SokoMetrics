
import { Submission, SubmissionStatus, User, ContributorType } from './types';

export const POINT_VALUES = {
  BASE_SUBMISSION: 10,
  PHOTO_BONUS: 10,
  GEO_BONUS: 5,
  ACCURACY_BONUS: 15, // Awarded if price is within 5% of median
  STREAK_BONUS: 5,    // Awarded for daily activity
  REJECTION_PENALTY: 20,
};

export const FX_RATES: Record<string, number> = {
  'RWF': 1393,
  'KES': 130,
  'UGX': 3775,
  'TZS': 2600,
  'BIF': 2850,
  'USD': 1
};

export const RANKS = [
  { label: 'Bronze', min: 0, color: 'text-amber-700', bg: 'bg-amber-100', icon: 'fa-award' },
  { label: 'Silver', min: 500, color: 'text-slate-500', bg: 'bg-slate-100', icon: 'fa-medal', bonus: 50 },
  { label: 'Gold', min: 2000, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'fa-trophy', bonus: 100 },
  { label: 'Platinum', min: 5000, color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'fa-crown', bonus: 250 },
];

export const calculateMedian = (prices: number[]): number => {
  if (prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Workflow 5: Duplicate Detection
export const detectDuplicate = (newSub: Partial<Submission>, existing: Submission[]): boolean => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  return existing.some(s => 
    s.contributorId === newSub.contributorId &&
    s.productId === newSub.productId &&
    s.brandId === newSub.brandId &&
    s.supplierName?.toLowerCase() === newSub.supplierName?.toLowerCase() &&
    (now - new Date(s.timestamp).getTime()) < ONE_DAY
  );
};

// Workflow 1: Detailed Decision Logic with Points Calculation
export const validateSubmission = (newSub: Submission, median: number, user: User) => {
  if (median === 0) return { status: SubmissionStatus.PENDING, deviation: 0, points: POINT_VALUES.BASE_SUBMISSION };
  
  const deviation = ((newSub.priceLocal - median) / median) * 100;
  const absDev = Math.abs(deviation);

  // Workflow 1 - Step 4: Decision Logic
  const isTrusted = user.trustScore >= 80;
  const withinNormalRange = absDev < 15;
  const hasStrongEvidence = newSub.hasPhoto || user.submissionsCount > 20;

  // Calculate potential points
  let calculatedPoints = POINT_VALUES.BASE_SUBMISSION;
  if (newSub.hasPhoto) calculatedPoints += POINT_VALUES.PHOTO_BONUS;
  if (newSub.latitude && newSub.longitude) calculatedPoints += POINT_VALUES.GEO_BONUS;
  if (absDev <= 5) calculatedPoints += POINT_VALUES.ACCURACY_BONUS;

  if (isTrusted && withinNormalRange && hasStrongEvidence) {
    return { 
      status: SubmissionStatus.APPROVED, 
      deviation, 
      points: calculatedPoints 
    };
  }

  if (absDev > 20 || user.trustScore < 50) {
    return { 
      status: SubmissionStatus.FLAGGED, 
      deviation, 
      reason: absDev > 20 ? "Outlier" : "New Contributor Review",
      points: 0
    };
  }

  return { status: SubmissionStatus.PENDING, deviation, points: calculatedPoints };
};

// Workflow 2: Trust Score Recalculation
export const calculateUserTrustAdjustment = (user: User, action: 'Approved' | 'Rejected', deviation: number = 0, hasPhoto: boolean = false): number => {
  let adjustment = 0;

  if (action === 'Approved') {
    if (Math.abs(deviation) <= 15) adjustment += 2; // Consistency bonus
    if (hasPhoto) adjustment += 1; // Verification bonus
  } else {
    adjustment -= 5; // Rejection penalty
  }

  // Cap logic
  const newScore = Math.min(100, Math.max(20, user.trustScore + adjustment));
  return newScore;
};

export const getCurrentRank = (points: number) => {
  return [...RANKS].reverse().find(r => points >= r.min) || RANKS[0];
};

export const getNextRank = (points: number) => {
  return RANKS.find(r => r.min > points) || null;
};

export const formatCurrency = (val: number, currency: string = 'RWF') => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency === 'USD' ? 'USD' : 'KES', 
    maximumFractionDigits: 0 
  }).format(val).replace('KES', currency);
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
