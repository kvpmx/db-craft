import { DEFAULT_TYPE_NORMALIZATIONS } from '@/lib/constants/diagram';

export const normalizeType = (type: string): string => {
  const cleanType = type.toLowerCase().trim();
  return (DEFAULT_TYPE_NORMALIZATIONS[cleanType] ?? type).toUpperCase();
};
