import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * Merge and deduplicate class names, including Tailwind CSS utility classes.
 *
 * Combines the functionality of `clsx` for conditional class merging and `tailwind-merge`
 * for resolving conflicting Tailwind CSS classes.
 *
 * @param inputs - The class names to merge. It can include strings, arrays, objects, or falsy values.
 * @returns A single string with merged and deduplicated class names.
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Pause execution for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait before resolving.
 * @returns A promise that resolves after the specified delay.
 */
export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};
