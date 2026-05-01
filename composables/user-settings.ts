import { queryOptions } from '@tanstack/vue-query';
import { UserSettingsController } from '@/lib/controllers';

import type { UserSettings } from '@/types/user-settings';
import type { TablesUpdate } from '@/types/database';

const DEFAULT_USER_SETTINGS: UserSettings = {
  profile_settings: {
    language: 'en',
  },
  diagram_settings: {
    show_relation_cardinality: true,
  },
};

const normalizeUserSettings = (settings?: Partial<UserSettings> | null): UserSettings => {
  return {
    profile_settings: {
      ...DEFAULT_USER_SETTINGS.profile_settings,
      ...settings?.profile_settings,
    },
    diagram_settings: {
      ...DEFAULT_USER_SETTINGS.diagram_settings,
      ...settings?.diagram_settings,
    },
  };
};

const getUserSettingsQueryOptions = (settingsApi: Pick<UserSettingsController, 'getOrCreate'>) => {
  return queryOptions({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const retrievedSettings = await settingsApi.getOrCreate();
      return normalizeUserSettings(retrievedSettings);
    },
  });
};

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const settingsApi = useApiController(UserSettingsController);
  const userSettingsQueryOptions = getUserSettingsQueryOptions(settingsApi);

  const settingsQuery = useQuery(userSettingsQueryOptions);
  const settings = computed(() => settingsQuery.data.value ?? normalizeUserSettings());

  const { mutateAsync: updateSettings, isPending: isSaving } = useMutation({
    mutationKey: ['update-user-settings'],
    mutationFn: async (payload: TablesUpdate<'user_settings'>) => {
      return await settingsApi.update(payload);
    },
    onSuccess: (savedSettings) => {
      if (savedSettings) {
        queryClient.setQueryData(
          userSettingsQueryOptions.queryKey,
          normalizeUserSettings(savedSettings)
        );
      }
    },
  });

  return { settings, updateSettings, isLoading: settingsQuery.isPending, isSaving };
};
