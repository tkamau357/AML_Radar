export interface ScreeningSummary {
  id: number;
  transactionId: string;
  score: number;
  severity: Severity;
  alert: boolean;
  alertThreshold: number;
  enrichmentStatus: string;
  screenedAt: string;
}

export interface ScreeningDetail {
  id: number;
  transactionId: string;
  score: number;
  severity: Severity;
  alert: boolean;
  alertThreshold: number;
  enrichmentStatus: string;
  screenedAt: string;
  transaction: TransactionDetail | null;
  hits: FeatureHit[];
  ruleBasedScore: number;
  sanctionScore: number;
  mlScore: number;
  ruleBasedScores: FeatureScore[];
  sanctionScores: FeatureScore[];
  mlScores: FeatureScore[];
}

export interface TransactionDetail {
  transactionId: string;
  customerId: string;
  accountId: string;
  amount: number;
  currency: string;
  transactionType: string;
  channel: string;
  occurredAt: string;
  beneficiaryAccountId: string | null;
  narration: string | null;
  counterpartyName: string | null;
  counterpartyBankCode: string | null;
  counterpartyCountry: string | null;
}

export interface FeatureHit {
  featureId: string;
  context: string;
  score: number;
  reason: string;
  evidence: Record<string, any>;
}

export interface FeatureScore {
  featureName: string;
  score: number;
}

export interface ScreeningStats {
  totalScreened: number;
  totalAlerts: number;
  totalClear: number;
  totalLow: number;
  totalMedium: number;
  totalHigh: number;
  totalCritical: number;
  alertRate: number;
}

export type Severity = 'CLEAR' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const SEVERITY_BADGE: Record<Severity, string> = {
  CLEAR:    'badge-success',
  LOW:      'badge-info',
  MEDIUM:   'badge-warning',
  HIGH:     'badge-danger',
  CRITICAL: 'badge-dark',
};
