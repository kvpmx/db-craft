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

  const loadingToastId = ref<string | number>();

  const onMutate = (variables: TVariables) => {
    if (loadingMessage) {
      loadingToastId.value = toast.loading(loadingMessage);
    }

    if (mutationOptions.onMutate) {
      return mutationOptions.onMutate(variables);
    }
  };

  const onError = (error: TError, variables: TVariables, context: TContext | undefined) => {
    toast.dismiss(loadingToastId.value);
    toast.error(errorMessage ?? error.toString());

    if (mutationOptions.onError) {
      return mutationOptions.onError(error, variables, context);
    }
  };

  const onSuccess = (data: TData, variables: TVariables, context: TContext) => {
    toast.dismiss(loadingToastId.value);

    if (successMessage) {
      toast.success(successMessage);
    }

    if (mutationOptions.onSuccess) {
      return mutationOptions.onSuccess(data, variables, context);
    }
  };

  return useMutation({ ...mutationOptions, onMutate, onError, onSuccess }, queryClient);
};
