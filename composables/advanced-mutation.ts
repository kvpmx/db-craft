import { toast } from 'vue-sonner';
import type { DefaultError, QueryClient, MutationOptions } from '@tanstack/vue-query';

type AdvancedMutationOptions<TData, TError, TVariables, TContext> = MutationOptions<
  TData,
  TError,
  TVariables,
  TContext
> & {
  errorMessage?: string;
  successMessage?: string;
  loadingMessage?: string;
};

export const useAdvancedMutation = <
  TData = unknown,
  TError extends Error = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: AdvancedMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient
) => {
  const {
    errorMessage = 'There was an error, please try again later',
    successMessage = 'Success!',
    loadingMessage = 'Loading...',
    ...mutationOptions
  } = options;

  let loadingToastId: string | number;

  return useMutation(
    {
      ...mutationOptions,
      onMutate: (variables) => {
        if (loadingMessage) {
          loadingToastId = toast.loading(loadingMessage);
        }

        if (mutationOptions.onMutate) {
          return mutationOptions.onMutate(variables);
        }
      },
      onError: (error, variables, context) => {
        toast.dismiss(loadingToastId);
        toast.error(errorMessage ?? error.toString());

        if (mutationOptions.onError) {
          return mutationOptions.onError(error, variables, context);
        }
      },
      onSuccess: (data, variables, context) => {
        toast.dismiss(loadingToastId);

        if (successMessage) {
          toast.success(successMessage);
        }

        if (mutationOptions.onSuccess) {
          return mutationOptions.onSuccess(data, variables, context);
        }
      },
    },
    queryClient
  );
};
