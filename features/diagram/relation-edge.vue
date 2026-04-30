<script lang="ts" setup>
  import { BaseEdge, EdgeLabelRenderer, Position, getSmoothStepPath } from '@vue-flow/core';
  import {
    DEFAULT_RELATION_CARDINALITY,
    RELATION_CARDINALITY_OPTIONS,
  } from '@/lib/constants/diagram';

  import type { EdgeProps } from '@vue-flow/core';
  import type { RelationCardinality, RelationEndpointCardinality } from '@/types/diagram';

  defineOptions({
    inheritAttrs: false,
  });

  const props = defineProps<EdgeProps<RelationCardinality & { readonly?: boolean }>>();

  const { t } = useI18n();

  const currentProject = useCurrentProject();
  const open = ref(false);

  const edgePathParams = computed(() =>
    getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition,
      borderRadius: 20,
      offset: 48,
    })
  );

  const edgePath = computed(() => edgePathParams.value[0]);
  const labelX = computed(() => edgePathParams.value[1]);
  const labelY = computed(() => edgePathParams.value[2]);
  const edgeStroke = computed(() => (props.selected ? '#e11d48' : '#64748b'));

  const relation = computed(() => {
    return currentProject.state?.schema.relations.find((rel) => rel.id === props.id);
  });

  const cardinality = computed<RelationCardinality>(() => {
    return {
      ...DEFAULT_RELATION_CARDINALITY,
      ...props.data,
      ...relation.value?.cardinality,
    };
  });

  const sourceCardinality = computed({
    get: () => cardinality.value.source,
    set: (value) => updateCardinality('source', value as RelationEndpointCardinality),
  });

  const targetCardinality = computed({
    get: () => cardinality.value.target,
    set: (value) => updateCardinality('target', value as RelationEndpointCardinality),
  });

  const updateCardinality = (
    side: keyof RelationCardinality,
    value: RelationEndpointCardinality
  ) => {
    if (props.data?.readonly || !relation.value) return;

    relation.value.cardinality = {
      ...DEFAULT_RELATION_CARDINALITY,
      ...relation.value.cardinality,
      [side]: value,
    };
  };

  const openPopup = () => {
    if (!props.data?.readonly) {
      open.value = true;
    }
  };

  const getEndpointTransform = (x: number, y: number, position: Position) => {
    const rotation = position === Position.Left ? 180 : 0;
    return `translate(${x} ${y}) rotate(${rotation})`;
  };

  const hasOptionalCircle = (value: RelationEndpointCardinality) => {
    return value === 'zero-or-one' || value === 'zero-or-many';
  };

  const hasOneBar = (value: RelationEndpointCardinality) => {
    return value === 'one' || value === 'one-and-only-one' || value === 'one-or-many';
  };

  const hasSecondBar = (value: RelationEndpointCardinality) => {
    return value === 'zero-or-one' || value === 'one-and-only-one';
  };

  const hasCrowFoot = (value: RelationEndpointCardinality) => {
    return value === 'many' || value === 'zero-or-many' || value === 'one-or-many';
  };

  const getPrimaryMarkerX = (value: RelationEndpointCardinality) => {
    return hasCrowFoot(value) ? 24 : 8;
  };

  const getSecondaryMarkerX = (value: RelationEndpointCardinality) => {
    return hasCrowFoot(value) ? 32 : 16;
  };

  const getOptionLabel = (value: RelationEndpointCardinality) => {
    const option = RELATION_CARDINALITY_OPTIONS.find((option) => option.value === value);
    return option ? t(option.labelKey) : value;
  };

  const getOptionNotation = (value: RelationEndpointCardinality) => {
    return RELATION_CARDINALITY_OPTIONS.find((option) => option.value === value)?.notation ?? value;
  };
</script>

<template>
  <BaseEdge :id="id" :path="edgePath" :style="{ strokeWidth: 3, stroke: edgeStroke }" />

  <path
    :d="edgePath"
    fill="none"
    stroke="transparent"
    stroke-width="18"
    class="cursor-pointer"
    @click="openPopup"
  />

  <g
    class="pointer-events-none"
    :style="{ color: edgeStroke }"
    :transform="getEndpointTransform(sourceX, sourceY, sourcePosition)"
  >
    <circle
      v-if="hasOptionalCircle(cardinality.source)"
      :cx="getPrimaryMarkerX(cardinality.source)"
      cy="0"
      r="4"
      fill="white"
      stroke="currentColor"
      stroke-width="2"
    />
    <line
      v-if="hasOneBar(cardinality.source)"
      :x1="getPrimaryMarkerX(cardinality.source)"
      y1="-8"
      :x2="getPrimaryMarkerX(cardinality.source)"
      y2="8"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
    <line
      v-if="hasSecondBar(cardinality.source)"
      :x1="getSecondaryMarkerX(cardinality.source)"
      y1="-8"
      :x2="getSecondaryMarkerX(cardinality.source)"
      y2="8"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
    <g v-if="hasCrowFoot(cardinality.source)">
      <line
        x1="2"
        y1="-8"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="2"
        y1="0"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="2"
        y1="8"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
  </g>

  <g
    class="pointer-events-none"
    :style="{ color: edgeStroke }"
    :transform="getEndpointTransform(targetX, targetY, targetPosition)"
  >
    <circle
      v-if="hasOptionalCircle(cardinality.target)"
      :cx="getPrimaryMarkerX(cardinality.target)"
      cy="0"
      r="4"
      fill="white"
      stroke="currentColor"
      stroke-width="2"
    />
    <line
      v-if="hasOneBar(cardinality.target)"
      :x1="getPrimaryMarkerX(cardinality.target)"
      y1="-8"
      :x2="getPrimaryMarkerX(cardinality.target)"
      y2="8"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
    <line
      v-if="hasSecondBar(cardinality.target)"
      :x1="getSecondaryMarkerX(cardinality.target)"
      y1="-8"
      :x2="getSecondaryMarkerX(cardinality.target)"
      y2="8"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
    <g v-if="hasCrowFoot(cardinality.target)">
      <line
        x1="2"
        y1="-8"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="2"
        y1="0"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="2"
        y1="8"
        x2="18"
        y2="0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
  </g>

  <EdgeLabelRenderer>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :class="[
            'nodrag nopan absolute rounded-full border bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm',
            selected ? 'border-rose-600 text-rose-600' : 'border-slate-300 text-slate-600',
            data?.readonly ? 'cursor-default' : 'cursor-pointer hover:border-rose-600',
          ]"
          :style="{
            pointerEvents: data?.readonly ? 'none' : 'all',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }"
        >
          {{ getOptionNotation(cardinality.source) }} : {{ getOptionNotation(cardinality.target) }}
        </button>
      </PopoverTrigger>

      <PopoverContent class="nodrag nopan w-60 space-y-2.5" @click.stop>
        <div class="space-y-1">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('RELATION_CARDINALITY') }}</h3>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs">{{ t('SOURCE_END') }}</Label>
          <Select v-model="sourceCardinality">
            <SelectTrigger class="h-8 px-2 py-1 text-xs">
              <span class="truncate">{{ getOptionLabel(sourceCardinality) }}</span>
            </SelectTrigger>
            <SelectContent class="min-w-44">
              <SelectItem
                v-for="option in RELATION_CARDINALITY_OPTIONS"
                :key="option.value"
                :value="option.value"
                class="py-1 pl-7 pr-14 text-xs"
              >
                <span>
                  {{ t(option.labelKey) }}
                  <span
                    class="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-400"
                  >
                    {{ option.notation }}
                  </span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs">{{ t('TARGET_END') }}</Label>
          <Select v-model="targetCardinality">
            <SelectTrigger class="h-8 px-2 py-1 text-xs">
              <span class="truncate">{{ getOptionLabel(targetCardinality) }}</span>
            </SelectTrigger>
            <SelectContent class="min-w-44">
              <SelectItem
                v-for="option in RELATION_CARDINALITY_OPTIONS"
                :key="option.value"
                :value="option.value"
                class="py-1 pl-7 pr-14 text-xs"
              >
                <span>
                  {{ t(option.labelKey) }}
                  <span
                    class="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-400"
                  >
                    {{ option.notation }}
                  </span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  </EdgeLabelRenderer>
</template>
