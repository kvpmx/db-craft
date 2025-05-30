import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

export { default as Toggle } from './toggle-component.vue';

export const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-slate-200 bg-transparent hover:bg-slate-100 hover:text-slate-900',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
