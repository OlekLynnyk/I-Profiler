// types/plan.ts

export const PACKAGE_TYPES = ['Freemium', 'Select', 'Smarter', 'Business'] as const;
export type ValidPackageType = (typeof PACKAGE_TYPES)[number];
export type PackageType = ValidPackageType | string;

export const PACKAGE_LIMITS: Record<
  ValidPackageType,
  {
    requestsPerMonth: number;
    dailyGenerations: number;
    allowExport: boolean;
    allowCustomBranding: boolean;
  }
> = {
  Freemium: {
    requestsPerMonth: 3,
    dailyGenerations: 3,
    allowExport: false,
    allowCustomBranding: false,
  },
  Select: {
    requestsPerMonth: 15,
    dailyGenerations: 15,
    allowExport: true,
    allowCustomBranding: true,
  },
  Smarter: {
    requestsPerMonth: 75,
    dailyGenerations: 25,
    allowExport: true,
    allowCustomBranding: true,
  },
  Business: {
    requestsPerMonth: 200,
    dailyGenerations: 25,
    allowExport: true,
    allowCustomBranding: true,
  },
};

export function isValidPackageType(pkg: string): pkg is ValidPackageType {
  return PACKAGE_TYPES.includes(pkg as ValidPackageType);
}

export const PRICE_TO_PACKAGE: Record<string, ValidPackageType> = {
  // CANARY (LIVE) — временно для теста на проде
  price_1S8L8RAGnqjZyhfASTwZaQjP: 'Business', // t1 €0.10
  price_1S8L8kAGnqjZyhfAvCn79rcj: 'Smarter', // t2 €0.15
  price_1S8L91AGnqjZyhfAQiUw4Qey: 'Select', // t3 €0.20
};

export const PACKAGE_TO_PRICE: Partial<Record<ValidPackageType, string>> = {
  // CANARY (LIVE) — временно для теста на проде
  Business: 'price_1S8L8RAGnqjZyhfASTwZaQjP',
  Smarter: 'price_1S8L8kAGnqjZyhfAvCn79rcj',
  Select: 'price_1S8L91AGnqjZyhfAQiUw4Qey',
};

export type NormalizedSubscriptionStatus = 'active' | 'incomplete' | 'canceled';

export interface SubscriptionPlanPayload {
  plan: ValidPackageType;
  priceId: string;
  /** могут временно отсутствовать в ранних эвентах */
  periodStart?: string | null;
  periodEnd?: string | null;
  status: NormalizedSubscriptionStatus;
}

/** статусы — как согласовали на Шаге 3b */
export function mapStripeStatus(status: string): NormalizedSubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    case 'canceled':
    default:
      return 'canceled';
  }
}

export const PAID_PLANS = ['Select', 'Smarter', 'Business'] as const;

export function isPaidPlan(plan: PackageType): plan is ValidPackageType {
  return isValidPackageType(plan) && plan !== 'Freemium';
}
