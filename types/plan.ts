export const PACKAGE_TYPES = ['Freemium', 'Smarter', 'Business'] as const;
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
    requestsPerMonth: 10,
    dailyGenerations: 5,
    allowExport: false,
    allowCustomBranding: false,
  },
  Smarter: {
    requestsPerMonth: 250,
    dailyGenerations: 25,
    allowExport: true,
    allowCustomBranding: true,
  },
  Business: {
    requestsPerMonth: 1000,
    dailyGenerations: 100,
    allowExport: true,
    allowCustomBranding: true,
  },
};

export function isValidPackageType(pkg: string): pkg is ValidPackageType {
  return PACKAGE_TYPES.includes(pkg as ValidPackageType);
}

// --- central mapping & status normalization ---

/**
 * Единая карта соответствия Stripe price_id → внутренний план.
 * Взято из текущего webhook: PLAN_MAPPING.
 * Держим ТОЛЬКО реальные price_id Stripe (без "freemium").
 */
export const PRICE_TO_PACKAGE: Record<string, ValidPackageType> = {
  price_1RQYE4AGnqjZyhfAY8kOMZwm: 'Smarter',
  price_1RQYEXAGnqjZyhfAryCzNkqV: 'Business',
};

export type NormalizedSubscriptionStatus = 'active' | 'incomplete' | 'canceled';

export interface SubscriptionPlanPayload {
  plan: ValidPackageType;
  priceId: string;
  periodStart: string; // ISO-строка из Stripe current_period_start
  periodEnd: string; // ISO-строка из Stripe current_period_end
  status: NormalizedSubscriptionStatus;
}

/**
 * Единая трактовка статусов Stripe → внутренний статус.
 * past_due считаем 'active' (доступ сохраняется),
 * unpaid и canceled считаем 'canceled'.
 */
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
