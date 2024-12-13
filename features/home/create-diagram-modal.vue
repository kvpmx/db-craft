<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';

  const { t } = useI18n();
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const databases = [
    { name: 'MySQL', value: 'mysql', icon: 'devicon:mysql' },
    { name: 'PostgreSQL', value: 'postgresql', icon: 'devicon:postgresql' },
    { name: 'SQL Server', value: 'sqlserver', icon: 'devicon:microsoftsqlserver' },
  ];

  const validationSchema = toTypedSchema(
    z.object({
      name: z.string({ required_error: t('NAME_REQUIRED') }),
      visibility: z.enum(['public', 'private']).default('public'),
      type: z.enum(['mysql', 'postgresql', 'sqlserver']).default('mysql'),
    })
  );

  const { handleSubmit } = useForm({ validationSchema });

  const submitCreateDiagramForm = handleSubmit(async (data) => {
    if (!user.value) return;

    await supabase.from('projects').insert({
      ...data,
      author: user.value.id,
    });
  });
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button>
        <Icon name="lucide:plus" size="1rem" class="mr-2" />
        {{ t('NEW_PROJECT') }}
      </Button>
    </DialogTrigger>

    <DialogScrollContent class="max-w-[95%] sm:max-w-[600px]" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle class="text-2xl font-semibold">
          {{ t('NEW_DIAGAM_MODAL_TITLE') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('NEW_DIAGAM_MODAL_DESCRIPTION') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <form class="space-y-6" @submit="submitCreateDiagramForm">
          <!-- Diagram name -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>{{ t('DIAGRAM_NAME') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Diagram visibility -->
          <FormField v-slot="{ componentField }" type="radio" name="visibility">
            <FormItem>
              <FormLabel>{{ t('DIAGRAM_VISIBILITY') }}</FormLabel>

              <FormControl>
                <RadioGroup class="flex gap-4" v-bind="componentField" default-value="public">
                  <FormItem class="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel class="font-normal">{{ t('PUBLIC') }}</FormLabel>
                  </FormItem>

                  <FormItem class="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel class="font-normal">{{ t('PRIVATE') }}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Database type -->
          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>{{ t('DATABASE_TYPE') }}</FormLabel>

              <FormControl>
                <ToggleGroup
                  v-bind="componentField"
                  type="single"
                  :default-value="databases[0].value"
                  class="flex flex-wrap gap-4"
                >
                  <ToggleGroupItem
                    v-for="db in databases"
                    :key="db.name"
                    :value="db.value"
                    class="hover:border-primary relative h-auto min-w-40 flex-1 cursor-pointer rounded-lg border p-4 transition-colors"
                  >
                    <div class="flex flex-col items-center gap-2">
                      <Icon :name="db.icon" :alt="db.name" size="2rem" />
                      <span class="text-sm font-medium">{{ db.name }}</span>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Submit button -->
          <DialogFooter>
            <Button class="w-full sm:ml-auto sm:w-auto" size="lg">{{ t('CREATE_DIAGRAM') }}</Button>
          </DialogFooter>
        </form>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
