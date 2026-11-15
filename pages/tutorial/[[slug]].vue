<script setup lang="ts">
  import { routes } from '@/lib/routes';
  import { TUTORIAL_SECTIONS } from '@/lib/tutorial/constants';
  import { resolveTutorialLocale, tutorialMessages } from '@/lib/tutorial/messages';

  definePageMeta({ key: (route) => route.path });

  const route = useRoute();
  const user = useSupabaseUser();
  const { locale } = useI18n();
  const tutorialLocale = computed(() => resolveTutorialLocale(locale.value));
  const copy = computed(() => tutorialMessages[tutorialLocale.value]);
  const query = ref('');
  const menuOpen = ref(false);
  const slug = String(route.params.slug ?? '');
  const articlePath = routes.tutorial(slug);

  const loadNavigation = () => {
    const articles =
      resolveTutorialLocale(locale.value) === 'uk'
        ? queryCollection('tutorial_uk')
            .order('stem', 'ASC')
            .select('path', 'title', 'description', 'section', 'icon')
            .all()
        : queryCollection('tutorial')
            .order('stem', 'ASC')
            .select('path', 'title', 'description', 'section', 'icon')
            .all();

    return articles;
  };

  const loadSearchSections = () => {
    return resolveTutorialLocale(locale.value) === 'uk'
      ? queryCollectionSearchSections('tutorial_uk')
      : queryCollectionSearchSections('tutorial');
  };

  const loadArticle = () => {
    return resolveTutorialLocale(locale.value) === 'uk'
      ? queryCollection('tutorial_uk').path(articlePath).first()
      : queryCollection('tutorial').path(articlePath).first();
  };

  const [
    { data: tutorialArticles, error: catalogError },
    { data: searchSections, error: searchError },
  ] = await Promise.all([
    useAsyncData(`tutorial-navigation:${tutorialLocale.value}`, loadNavigation, {
      default: () => [],
      watch: [tutorialLocale],
    }),
    useAsyncData(`tutorial-search:${tutorialLocale.value}`, loadSearchSections, {
      default: () => [],
      watch: [tutorialLocale],
    }),
  ]);

  const { data: article, error: articleError } = await useAsyncData(
    `tutorial-article:${tutorialLocale.value}:${articlePath}`,
    loadArticle,
    { watch: [tutorialLocale] }
  );

  if (catalogError.value || searchError.value || articleError.value) {
    throw createError(catalogError.value || searchError.value || articleError.value!);
  }

  if (slug && !article.value) {
    throw createError({ statusCode: 404, statusMessage: copy.value.notFound });
  }

  const articleIndex = computed(() => {
    return tutorialArticles.value.findIndex((item) => item.path === articlePath);
  });

  const previous = computed(() => tutorialArticles.value[articleIndex.value - 1]);
  const next = computed(() => tutorialArticles.value[articleIndex.value + 1]);
  const headings = computed(() => {
    return (article.value?.body.toc?.links ?? []).flatMap((heading) => [
      heading,
      ...(heading.children ?? []),
    ]);
  });

  const normalizeSearch = (text: string) => {
    return text.normalize('NFKC').toLowerCase().replace(/[’ʼ]/g, "'");
  };

  const searchText = computed(() => {
    const text = new Map<string, string>();

    for (const section of searchSections.value) {
      const path = section.id.split('#')[0];
      text.set(path, `${text.get(path) ?? ''} ${section.title} ${section.content}`);
    }

    return text;
  });

  const minutes = (path: string) => {
    return Math.max(
      1,
      Math.ceil((searchText.value.get(path) ?? '').trim().split(/\s+/).length / 180)
    );
  };

  const results = computed(() => {
    const terms = normalizeSearch(query.value).trim().split(/\s+/).filter(Boolean);

    return tutorialArticles.value.filter((item) => {
      const text = normalizeSearch(
        `${item.title} ${item.description} ${copy.value.sections[item.section]} ${searchText.value.get(item.path) ?? ''}`
      );

      return terms.every((term) => text.includes(term));
    });
  });

  useSeoMeta({
    title: () => `${article.value?.title ?? copy.value.tutorial} · DB Craft`,
    description: () => article.value?.description ?? copy.value.seoDescription,
  });
</script>

<template>
  <div :lang="tutorialLocale" class="min-h-screen bg-white text-slate-900">
    <a
      href="#tutorial-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:p-3 focus:ring-2"
    >
      {{ copy.skipContent }}
    </a>
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div
        class="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 lg:px-8"
      >
        <div class="flex items-center gap-5">
          <NuxtLink :to="routes.home()">
            <img src="/images/logo.png" :alt="copy.home" class="w-16 min-[360px]:w-20 sm:w-32" />
          </NuxtLink>
          <span class="hidden h-5 border-l border-slate-200 sm:block" />
          <NuxtLink
            :to="routes.tutorial()"
            class="hidden text-sm font-medium text-slate-500 sm:block"
          >
            {{ copy.tutorial }}
          </NuxtLink>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-3">
          <NuxtLink
            :to="user ? routes.home() : routes.login()"
            class="rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-medium text-white hover:bg-slate-700 sm:px-4 sm:text-sm"
          >
            {{ user ? copy.projects : copy.login }}
            <span aria-hidden="true" class="hidden sm:inline">↗</span>
          </NuxtLink>
          <button
            type="button"
            class="rounded-md border p-1.5 sm:p-2 lg:hidden"
            :aria-expanded="menuOpen"
            aria-controls="tutorial-navigation"
            :aria-label="copy.toggleNavigation"
            @click="menuOpen = !menuOpen"
          >
            <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
    <div class="mx-auto grid max-w-[1600px] lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside
        id="tutorial-navigation"
        :class="[
          menuOpen ? 'block' : 'hidden',
          'border-b border-slate-200 bg-slate-50/60 px-5 py-7 lg:sticky lg:top-[72px] lg:block lg:h-[calc(100vh-72px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-6',
        ]"
      >
        <NuxtLink
          :to="routes.tutorial()"
          class="mb-6 flex items-center gap-2 text-sm font-semibold"
          :aria-current="!slug ? 'page' : undefined"
          @click="menuOpen = false"
        >
          <Icon name="lucide:book-open" class="h-4 w-4 text-blue-600" />
          {{ copy.overview }}
        </NuxtLink>
        <nav :aria-label="copy.articles" class="space-y-7">
          <div v-for="section in TUTORIAL_SECTIONS" :key="section">
            <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {{ copy.sections[section] }}
            </p>
            <NuxtLink
              v-for="item in tutorialArticles.filter((entry) => entry.section === section)"
              :key="item.path"
              :to="item.path"
              :aria-current="articlePath === item.path ? 'page' : undefined"
              :class="[
                '-mx-2 flex items-start gap-2.5 rounded-md px-2 py-2 text-[13px] leading-5 transition-colors',
                articlePath === item.path
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ]"
              @click="menuOpen = false"
            >
              <Icon :name="item.icon" class="mt-0.5 h-4 w-4 shrink-0" />{{ item.title }}
            </NuxtLink>
          </div>
        </nav>
        <p class="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-400">
          {{ copy.sidebarDescription }}
        </p>
      </aside>
      <main
        id="tutorial-content"
        tabindex="-1"
        class="min-w-0 px-5 py-8 outline-none sm:px-9 lg:px-12 lg:py-10"
      >
        <div class="relative mb-9 max-w-xl">
          <label for="tutorial-search" class="sr-only">{{ copy.searchLabel }}</label>
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
          />
          <input
            id="tutorial-search"
            v-model="query"
            type="search"
            :placeholder="copy.searchPlaceholder"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <section v-if="query.trim()" :aria-label="copy.searchResults">
          <h1 class="text-2xl font-semibold">{{ copy.searchResults }}</h1>
          <p role="status" class="mt-2 text-sm text-slate-500">
            {{ copy.searchCount(results.length, query.trim()) }}
          </p>
          <div class="mt-6 max-w-3xl divide-y divide-slate-200">
            <NuxtLink
              v-for="item in results"
              :key="item.path"
              :to="item.path"
              class="block rounded-lg px-2 py-5 hover:bg-slate-50"
              @click="query = ''"
            >
              <span class="text-xs text-blue-600">{{ copy.sections[item.section] }}</span>
              <h2 class="mt-1 font-semibold">{{ item.title }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.description }}</p>
            </NuxtLink>
          </div>
          <p v-if="!results.length" class="mt-8 text-slate-600">
            {{ copy.searchHint }}
          </p>
          <button
            type="button"
            class="mt-5 text-sm font-medium text-blue-700 hover:underline"
            @click="query = ''"
          >
            {{ copy.clearSearch }}
          </button>
        </section>
        <template v-else-if="article">
          <div class="grid items-start gap-12 xl:grid-cols-[minmax(0,760px)_190px]">
            <article class="min-w-0">
              <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                {{ copy.sections[article.section] }}
              </p>
              <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{{ article.title }}</h1>
              <p class="mb-8 mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Icon name="lucide:clock-3" class="h-3.5 w-3.5" />
                {{ copy.minutesRead(minutes(article.path)) }}
              </p>
              <details
                v-if="headings.length"
                class="mb-8 rounded-lg border border-slate-200 p-4 xl:hidden"
              >
                <summary class="cursor-pointer text-sm font-medium">{{ copy.onThisPage }}</summary>
                <nav class="mt-3 space-y-2" :aria-label="copy.articleContents">
                  <a
                    v-for="heading in headings"
                    :key="heading.id"
                    :href="`#${heading.id}`"
                    class="block text-sm text-slate-500"
                    :class="heading.depth === 3 && 'pl-3'"
                  >
                    {{ heading.text }}
                  </a>
                </nav>
              </details>
              <p class="mb-6 text-xs leading-6 text-slate-500">{{ copy.mediaNote }}</p>
              <TutorialArticleBody :key="`${tutorialLocale}:${article.path}`" :article="article" />
              <nav
                class="mt-12 grid grid-cols-1 gap-4 border-t border-slate-200 pt-7 sm:grid-cols-2"
                :aria-label="copy.pagination"
              >
                <NuxtLink
                  v-if="previous"
                  :to="previous.path"
                  class="rounded-xl border border-slate-200 p-4 hover:border-blue-300"
                >
                  <span class="text-xs text-slate-400">← {{ copy.previous }}</span>
                  <span class="mt-2 block text-sm font-semibold">
                    {{ previous.title }}
                  </span>
                </NuxtLink>
                <span v-else />
                <NuxtLink
                  v-if="next"
                  :to="next.path"
                  class="rounded-xl border border-slate-200 p-4 text-right hover:border-blue-300"
                >
                  <span class="text-xs text-slate-400">{{ copy.next }} →</span>
                  <span class="mt-2 block text-sm font-semibold">{{ next.title }}</span>
                </NuxtLink>
              </nav>
            </article>
            <nav
              v-if="headings.length"
              :aria-label="copy.onThisPage"
              class="sticky top-28 hidden max-h-[calc(100vh-140px)] overflow-y-auto border-l border-slate-200 pl-5 xl:block"
            >
              <p class="mb-4 text-xs font-semibold">{{ copy.onThisPage }}</p>
              <a
                v-for="heading in headings"
                :key="heading.id"
                :href="`#${heading.id}`"
                :class="[
                  'mb-3 block text-xs leading-5 text-slate-500 hover:text-blue-700',
                  heading.depth === 3 && 'pl-3',
                ]"
              >
                {{ heading.text }}
              </a>
            </nav>
          </div>
        </template>
        <template v-else>
          <div class="max-w-4xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              {{ copy.handbook }}
            </p>
            <h1
              class="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              {{ copy.heroFirstLine }}<br class="hidden sm:block" />
              {{ copy.heroSecondLine }}
            </h1>
            <p class="mt-5 max-w-xl text-base leading-7 text-slate-500">
              {{ copy.introduction }}
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-5">
              <NuxtLink
                :to="routes.tutorial('getting-started')"
                class="inline-flex items-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                {{ copy.createDiagram }} <Icon name="lucide:arrow-right" class="h-4 w-4" />
              </NuxtLink>
              <span class="text-xs text-slate-400">
                {{ copy.guideCount(tutorialArticles.length) }}
              </span>
            </div>
            <figure class="my-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src="/tutorial/media/editor-overview.png"
                :alt="copy.overviewImageAlt"
                width="1440"
                height="900"
                class="w-full"
              />
              <figcaption class="border-t bg-slate-50 px-4 py-3 text-xs text-slate-500">
                {{ copy.overviewImageCaption }}
              </figcaption>
            </figure>
            <section v-for="section in TUTORIAL_SECTIONS" :key="section" class="mb-10">
              <h2 class="mb-4 text-lg font-semibold">{{ copy.sections[section] }}</h2>
              <div class="grid gap-3 sm:grid-cols-2">
                <NuxtLink
                  v-for="item in tutorialArticles.filter((entry) => entry.section === section)"
                  :key="item.path"
                  :to="item.path"
                  class="group rounded-xl border border-slate-200 p-5 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <div class="mb-3 flex items-center justify-between">
                    <Icon :name="item.icon" class="h-5 w-5 text-blue-600" />
                    <span class="text-[11px] text-slate-400">
                      {{ copy.minutes(minutes(item.path)) }}
                    </span>
                  </div>
                  <h3 class="text-sm font-semibold group-hover:text-blue-700">{{ item.title }}</h3>
                  <p class="mt-2 text-xs leading-6 text-slate-500">
                    {{ item.description }}
                  </p>
                </NuxtLink>
              </div>
            </section>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
