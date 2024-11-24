import { cva } from 'class-variance-authority';

import type { HTMLAttributes } from 'vue';
import type { ToastRootProps } from 'radix-vue';
import type { VariantProps } from 'class-variance-authority';

export { default as Toast } from './toast-component.vue';
export { default as ToastAction } from './toast-action.vue';
export { default as ToastClose } from './toast-close.vue';
export { default as ToastDescription } from './toast-description.vue';
export { default as Toaster } from './toaster.vue';
export { default as ToastProvider } from './toast-provider.vue';
export { default as ToastTitle } from './toast-title.vue';
export { default as ToastViewport } from './toast-viewport.vue';
export { toast, useToast } from './use-toast';

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[--radix-toast-swipe-end-x] data-[swipe=move]:translate-x-[--radix-toast-swipe-move-x] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-slate-950',
        destructive: 'destructive group border-red-500 bg-red-500 text-slate-50',
        error: 'border bg-white text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ToastVariants = VariantProps<typeof toastVariants>;

export interface ToastProps extends ToastRootProps {
  class?: HTMLAttributes['class'];
  variant?: ToastVariants['variant'];
  onOpenChange?: ((value: boolean) => void) | undefined;
}
