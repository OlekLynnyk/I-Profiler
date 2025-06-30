export const PACKAGE_TYPES = ['Freemium', 'Smarter', 'Business'] as const;
export type ValidPackageType = typeof PACKAGE_TYPES[number];
export type PackageType = ValidPackageType | string;

export const PACKAGE_LIMITS: Record<ValidPackageType, {
  requestsPerMonth: number;
  dailyGenerations: number;
  allowExport: boolean;
  allowCustomBranding: boolean;
}> = {
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
