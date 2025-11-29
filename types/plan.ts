// types/plan.ts

export const PACKAGE_TYPES = ['Freemium', 'Premium', 'Business'] as const;
export type ValidPackageType = (typeof PACKAGE_TYPES)[number];
export type PackageType = ValidPackageType | string;

export const PACKAGE_LIMITS = {
  Freemium: {
    requestsPerMonth: 3,
    dailyGenerations: 3,
    allowExport: false,
    allowCustomBranding: false,
  },
  Premium: {
    requestsPerMonth: 25,
    dailyGenerations: 25,
    allowExport: true,
    allowCustomBranding: true,
  },
  Business: {
    requestsPerMonth: 10000,
    dailyGenerations: 100,
    allowExport: true,
    allowCustomBranding: true,
  },
} as const;

export function isValidPackageType(pkg: string): pkg is ValidPackageType {
  return PACKAGE_TYPES.includes(pkg as ValidPackageType);
}

export const PRICE_TO_PACKAGE: Record<string, ValidPackageType> = {
  price_1SYssAAGnqjZyhfAQOj6kr2x: 'Premium',
  price_1SYssQAGnqjZyhfAm4rvjIhY: 'Business',
};

export const PACKAGE_TO_PRICE: Partial<Record<ValidPackageType, string>> = {
  Premium: 'price_1SYssAAGnqjZyhfAQOj6kr2x',
  Business: 'price_1SYssQAGnqjZyhfAm4rvjIhY',
};

export type NormalizedSubscriptionStatus = 'active' | 'incomplete' | 'canceled';

export interface SubscriptionPlanPayload {
  plan: ValidPackageType;
  priceId: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  status: NormalizedSubscriptionStatus;
}

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

export const PAID_PLANS = ['Premium', 'Business'] as const;

export function isPaidPlan(plan: PackageType): plan is ValidPackageType {
  return isValidPackageType(plan) && plan !== 'Freemium';
}
