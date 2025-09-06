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
  price_1RQYE4AGnqjZyhfAY8kOMZwm: 'Smarter',
  price_1RQYEXAGnqjZyhfAryCzNkqV: 'Business',
  price_1S2wOPAGnqjZyhfAqHosAvL3: 'Select',
};

export const PACKAGE_TO_PRICE: Partial<Record<ValidPackageType, string>> = {
  Smarter: 'price_1RQYE4AGnqjZyhfAY8kOMZwm',
  Business: 'price_1RQYEXAGnqjZyhfAryCzNkqV',
  Select: 'price_1S2wOPAGnqjZyhfAqHosAvL3',
};

export type NormalizedSubscriptionStatus = 'active' | 'incomplete' | 'canceled';

export interface SubscriptionPlanPayload {
  plan: ValidPackageType;
  priceId: string;
  periodStart: string;
  periodEnd: string;
  status: NormalizedSubscriptionStatus;
}

export function mapStripeStatus(status: string): NormalizedSubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
      return 'active';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    case 'canceled':
    case 'unpaid':
    default:
      return 'canceled';
  }
}

/** ✅ Единый гейт платных планов */
export const PAID_PLANS = ['Select', 'Smarter', 'Business'] as const;

export function isPaidPlan(plan: PackageType): plan is ValidPackageType {
  return isValidPackageType(plan) && plan !== 'Freemium';
}
