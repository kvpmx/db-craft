import SettingsUserProfile from './user-profile.vue';
import SettingsDiagramSettings from './diagram-settings.vue';

import type { Component } from 'vue';
import type { UserSettings } from '@/types/user-settings';

export type SettingsGroup = keyof UserSettings;

export type SettingsTabConfig = {
  id: SettingsGroup;
  label: string;
  component: Component;
};

export const SETTINGS_TABS: readonly SettingsTabConfig[] = [
  {
    id: 'profile_settings',
    label: 'USER_PROFILE',
    component: SettingsUserProfile,
  },
  {
    id: 'diagram_settings',
    label: 'DIAGRAM_SETTINGS',
    component: SettingsDiagramSettings,
  },
];
