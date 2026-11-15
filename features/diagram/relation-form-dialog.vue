<script lang="ts" setup>
  import z from 'zod';
  import { v4 as uuidv4 } from 'uuid';
  import { toTypedSchema } from '@vee-validate/zod';
  import { RelationEndpointCardinalitySchema } from '@/lib/constants/schema';
  import {
    getDefaultRelationName,
    getHandlePlacement,
    getRelationFieldType,
    relationFieldTypesMatch,
  } from '@/utils/relation';
  import {
    DEFAULT_RELATION_CARDINALITY,
    RELATION_CARDINALITY_OPTIONS,
  } from '@/lib/constants/diagram';

  import type { RelationEndpointCardinality, TableRelation } from '@/types/diagram';

  const props = defineProps<{
    open: boolean;
    relation?: TableRelation;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'save': [];
  }>();

  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const isEditing = computed(() => Boolean(props.relation));
  const tables = computed(() => currentProject.state?.schema.tables ?? []);

  const constraintNameSchema = z
    .string()
    .optional()
    .transform((value) => value && sanitizeConstraintName(value));

  const validationSchema = toTypedSchema(
    z
      .object({
        name: constraintNameSchema,
        source: z.string().min(1, { message: t('SELECT_TABLE') }),
        sourceField: z.string().min(1, { message: t('SELECT_FIELD') }),
        target: z.string().min(1, { message: t('SELECT_TABLE') }),
        targetField: z.string().min(1, { message: t('SELECT_FIELD') }),
        sourceCardinality: RelationEndpointCardinalitySchema,
        targetCardinality: RelationEndpointCardinalitySchema,
      })
      .refine((data) => data.source !== data.target, {
        message: t('RELATION_SAME_TABLE'),
        path: ['target'],
      })
      .superRefine((data, ctx) => {
        if (props.relation) return;

        const tablesList = tables.value;

        if (
          relationFieldTypesMatch(
            tablesList,
            data.source,
            data.sourceField,
            data.target,
            data.targetField
          )
        ) {
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('RELATION_FIELD_TYPE_MISMATCH', {
            sourceType: getRelationFieldType(tablesList, data.source, data.sourceField),
            targetType: getRelationFieldType(tablesList, data.target, data.targetField),
          }),
          path: ['targetField'],
        });
      })
  );

  const buildInitialValues = () => {
    const tablesList = tables.value;
    const relation = props.relation;
    const source = relation?.source ?? tablesList[0]?.id ?? '';
    const target = relation?.target ?? tablesList[1]?.id ?? tablesList[0]?.id ?? '';
    const sourceTable = tablesList.find((table) => table.id === source);
    const targetTable = tablesList.find((table) => table.id === target);

    return {
      name: relation?.name ?? '',
      source,
      sourceField: relation?.source_field ?? sourceTable?.fields[0]?.id ?? '',
      target,
      targetField: relation?.target_field ?? targetTable?.fields[0]?.id ?? '',
      sourceCardinality: relation?.cardinality?.source ?? DEFAULT_RELATION_CARDINALITY.source,
      targetCardinality: relation?.cardinality?.target ?? DEFAULT_RELATION_CARDINALITY.target,
    };
  };

  const { handleSubmit, resetForm, values } = useForm({
    validationSchema,
    initialValues: buildInitialValues(),
  });

  const defaultName = computed(() => {
    if (!values.source || !values.target || !values.sourceField || !values.targetField) {
      return '';
    }

    return getDefaultRelationName(
      {
        id: props.relation?.id ?? 'draft',
        source: values.source,
        target: values.target,
        source_field: values.sourceField,
        target_field: values.targetField,
        source_handle_placement: 'right',
        target_handle_placement: 'left',
      },
      tables.value
    );
  });

  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) resetForm({ values: buildInitialValues() });
    }
  );

  const closeDialog = () => {
    emit('update:open', false);
  };

  const getOptionLabel = (value: RelationEndpointCardinality) => {
    const option = RELATION_CARDINALITY_OPTIONS.find((option) => option.value === value);
    return option ? t(option.labelKey) : value;
  };

  const selectTriggerClass = 'h-8 text-sm';
  const selectItemClass = 'text-sm';

  const submitRelationForm = handleSubmit((formValues) => {
    if (!currentProject.state) return;

    const sourceTable = tables.value.find((table) => table.id === formValues.source);
    const targetTable = tables.value.find((table) => table.id === formValues.target);
    if (!sourceTable || !targetTable) return;

    const placement = getHandlePlacement(sourceTable.position, targetTable.position);
    const trimmedName = formValues.name?.trim();
    const relationPayload = {
      name: trimmedName || undefined,
      source: formValues.source,
      target: formValues.target,
      source_field: formValues.sourceField,
      target_field: formValues.targetField,
      source_handle_placement: placement.source,
      target_handle_placement: placement.target,
      cardinality: {
        source: formValues.sourceCardinality,
        target: formValues.targetCardinality,
      },
    };

    if (isEditing.value && props.relation) {
      currentProject.updateRelation(props.relation.id, relationPayload);
    } else {
      currentProject.addRelation({
        id: uuidv4(),
        ...relationPayload,
      });
    }

    emit('save');
    closeDialog();
  });
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? t('EDIT_RELATION') : t('NEW_RELATION') }}
        </DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit="submitRelationForm">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem class="space-y-1.5">
            <FormLabel class="text-xs">{{ t('RELATION_NAME') }}</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                :placeholder="defaultName || t('RELATION_NAME_PLACEHOLDER')"
                autocomplete="off"
              />
            </FormControl>
            <FormDescription class="text-xs">{{ t('RELATION_NAME_DESCRIPTION') }}</FormDescription>
          </FormItem>
        </FormField>

        <div class="grid grid-cols-2 gap-3">
          <FormField
            v-slot="{ value: sourceId, handleChange: setSourceId, errorMessage: sourceError }"
            name="source"
          >
            <FormField
              v-slot="{
                value: sourceFieldId,
                handleChange: setSourceFieldId,
                errorMessage: fieldError,
              }"
              name="sourceField"
            >
              <FormItem class="space-y-1.5">
                <FormLabel class="text-xs">{{ t('SOURCE_FIELD') }}</FormLabel>
                <FormControl>
                  <DiagramTableFieldCascadeSelect
                    :table-id="sourceId"
                    :field-id="sourceFieldId"
                    :tables="tables"
                    :disabled="!currentProject.canEdit"
                    @update:table-id="setSourceId"
                    @update:field-id="setSourceFieldId"
                  />
                </FormControl>
                <p v-if="sourceError ?? fieldError" class="text-sm font-medium text-red-500">
                  {{ sourceError ?? fieldError }}
                </p>
              </FormItem>
            </FormField>
          </FormField>

          <FormField
            v-slot="{ value: targetId, handleChange: setTargetId, errorMessage: targetError }"
            name="target"
          >
            <FormField
              v-slot="{
                value: targetFieldId,
                handleChange: setTargetFieldId,
                errorMessage: fieldError,
              }"
              name="targetField"
            >
              <FormItem class="space-y-1.5">
                <FormLabel class="text-xs">{{ t('TARGET_FIELD') }}</FormLabel>
                <FormControl>
                  <DiagramTableFieldCascadeSelect
                    :table-id="targetId"
                    :field-id="targetFieldId"
                    :tables="tables"
                    :disabled="!currentProject.canEdit"
                    @update:table-id="setTargetId"
                    @update:field-id="setTargetFieldId"
                  />
                </FormControl>
                <p v-if="targetError ?? fieldError" class="text-sm font-medium text-red-500">
                  {{ targetError ?? fieldError }}
                </p>
              </FormItem>
            </FormField>
          </FormField>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormField v-slot="{ componentField }" name="sourceCardinality">
            <FormItem class="space-y-1.5">
              <FormLabel class="text-xs">{{ t('SOURCE_END') }}</FormLabel>
              <Select v-bind="componentField" :disabled="!currentProject.canEdit">
                <FormControl>
                  <SelectTrigger :class="selectTriggerClass">
                    <SelectValue>{{ getOptionLabel(componentField.modelValue) }}</SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent class="min-w-44">
                  <SelectItem
                    v-for="option in RELATION_CARDINALITY_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                    :class="cn(selectItemClass, 'py-1 pl-7 pr-14')"
                  >
                    <span>
                      {{ t(option.labelKey) }}
                      <span
                        class="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400"
                      >
                        {{ option.notation }}
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="targetCardinality">
            <FormItem class="space-y-1.5">
              <FormLabel class="text-xs">{{ t('TARGET_END') }}</FormLabel>
              <Select v-bind="componentField" :disabled="!currentProject.canEdit">
                <FormControl>
                  <SelectTrigger :class="selectTriggerClass">
                    <SelectValue>{{ getOptionLabel(componentField.modelValue) }}</SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent class="min-w-44">
                  <SelectItem
                    v-for="option in RELATION_CARDINALITY_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                    :class="cn(selectItemClass, 'py-1 pl-7 pr-14')"
                  >
                    <span>
                      {{ t(option.labelKey) }}
                      <span
                        class="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400"
                      >
                        {{ option.notation }}
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <DialogFooter class="gap-y-2">
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ t('CANCEL') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="!currentProject.canEdit">
            {{ isEditing ? t('SAVE') : t('ADD') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
