import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Avatar } from './avatar-component.vue';
export { default as AvatarFallback } from './avatar-fallback.vue';
export { default as AvatarImage } from './avatar-image.vue';

export const avatarVariant = cva(
  'inline-flex items-center justify-center font-normal text-neutral-950 select-none shrink-0 bg-neutral-100 overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-10 w-10 text-xs',
        base: 'h-16 w-16 text-2xl',
        lg: 'h-32 w-32 text-5xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
  }
);

export type AvatarVariants = VariantProps<typeof avatarVariant>;
