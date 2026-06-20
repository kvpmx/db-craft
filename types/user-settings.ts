import type { LocaleInfo } from '@nuxtjs/i18n';

export type ProfileSettings = {
  language: LocaleInfo['code'];
};

export type DiagramSettings = {
  show_relation_cardinality: boolean;
};

export type UserSettings = {
  profile_settings: ProfileSettings;
  diagram_settings: DiagramSettings;
};
