// types/plan.ts
export type PackageType = 'Freemium' | 'Smarter' | 'Business';

export const isValidPackageType = (value: string): value is PackageType => {
  return ['Freemium', 'Smarter', 'Business'].includes(value);
};
