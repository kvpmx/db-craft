<script setup lang="ts">
  import { resolveTutorialLocale, tutorialMessages } from '@/lib/tutorial/messages';

  const props = defineProps<{ src: string; alt: string }>();

  const { locale } = useI18n();

  const tutorialLocale = computed(() => resolveTutorialLocale(locale.value));
  const copy = computed(() => tutorialMessages[tutorialLocale.value]);

  const allowed = computed(() => {
    return /^\/tutorial\/media\/[a-z0-9-]+\.(png|webp|jpg|svg|webm|mp4)$/.test(props.src);
  });

  const isVideo = computed(() => /\.(webm|mp4)$/.test(props.src));
  const base = computed(() => props.src.replace(/\.(webm|mp4)$/, ''));
  const captionTrack = computed(() => {
    const ukrainian = tutorialLocale.value === 'uk';

    return {
      src: `${base.value}${ukrainian ? '.uk' : ''}.vtt`,
      srclang: ukrainian ? 'uk' : 'en',
      label: ukrainian ? 'Українська' : 'English',
    };
  });
</script>

<template>
  <figure v-if="allowed">
    <video
      v-if="isVideo"
      controls
      playsinline
      preload="none"
      :poster="`${base}.png`"
      :aria-label="alt"
    >
      <source :src="src" :type="src.endsWith('.webm') ? 'video/webm' : 'video/mp4'" />
      <track
        :key="captionTrack.srclang"
        kind="captions"
        :src="captionTrack.src"
        :srclang="captionTrack.srclang"
        :label="captionTrack.label"
        default
      />
      <a :href="src">{{ copy.downloadVideo }}</a>
    </video>
    <a v-else :href="src" target="_blank" rel="noopener" :aria-label="copy.fullImage(alt)">
      <img :src="src" :alt="alt" loading="lazy" width="1440" height="900" />
    </a>
    <figcaption>{{ alt }}. {{ isVideo ? copy.videoHint : copy.imageHint }}</figcaption>
  </figure>
</template>
