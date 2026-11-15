import type { TUTORIAL_SECTIONS } from './constants';
import messagesJson from './messages.json' with { type: 'json' };

type TutorialSection = (typeof TUTORIAL_SECTIONS)[number];

type PluralForms = {
  one: string;
  few: string;
  many: string;
};

type TutorialMessagesFile = {
  tutorial: string;
  home: string;
  projects: string;
  login: string;
  skipContent: string;
  toggleNavigation: string;
  overview: string;
  articles: string;
  sidebarDescription: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchResults: string;
  searchCount: string;
  searchCountUnit: PluralForms;
  searchHint: string;
  clearSearch: string;
  minutesRead: string;
  minutes: string;
  onThisPage: string;
  articleContents: string;
  pagination: string;
  previous: string;
  next: string;
  handbook: string;
  heroFirstLine: string;
  heroSecondLine: string;
  introduction: string;
  createDiagram: string;
  guideCount: string;
  guideCountUnit?: PluralForms;
  overviewImageAlt: string;
  overviewImageCaption: string;
  mediaNote: string;
  seoDescription: string;
  notFound: string;
  fullImage: string;
  imageHint: string;
  videoHint: string;
  downloadVideo: string;
  referenceTable: string;
  sections: Record<TutorialSection, string>;
};

type TutorialCopy = Omit<
  TutorialMessagesFile,
  | 'searchCount'
  | 'searchCountUnit'
  | 'minutesRead'
  | 'minutes'
  | 'guideCount'
  | 'guideCountUnit'
  | 'fullImage'
> & {
  searchCount: (count: number, query: string) => string;
  minutesRead: (count: number) => string;
  minutes: (count: number) => string;
  guideCount: (count: number) => string;
  fullImage: (title: string) => string;
};

export type TutorialLocale = 'en' | 'uk';

const pluralForm = (locale: TutorialLocale, count: number, forms: PluralForms) => {
  if (locale !== 'uk') return count === 1 ? forms.one : forms.many;

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return forms.one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few;
  return forms.many;
};

const fill = (template: string, values: Record<string, string | number>) => {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
};

const compile = (locale: TutorialLocale, messages: TutorialMessagesFile): TutorialCopy => {
  const {
    searchCount,
    searchCountUnit,
    minutesRead,
    minutes,
    guideCount,
    guideCountUnit,
    fullImage,
    ...copy
  } = messages;

  return {
    ...copy,
    searchCount: (count, query) => {
      return fill(searchCount, { count, query, unit: pluralForm(locale, count, searchCountUnit) });
    },
    minutesRead: (count) => fill(minutesRead, { count }),
    minutes: (count) => fill(minutes, { count }),
    guideCount: (count) => {
      return fill(guideCount, {
        count,
        unit: guideCountUnit ? pluralForm(locale, count, guideCountUnit) : '',
      });
    },
    fullImage: (title) => fill(fullImage, { title }),
  };
};

const messages: Record<TutorialLocale, TutorialMessagesFile> = messagesJson;

export const tutorialMessages: Record<TutorialLocale, TutorialCopy> = {
  en: compile('en', messages.en),
  uk: compile('uk', messages.uk),
};

export const resolveTutorialLocale = (locale: string): TutorialLocale => {
  return locale === 'uk' ? 'uk' : 'en';
};
