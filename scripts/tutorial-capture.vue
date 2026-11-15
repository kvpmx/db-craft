<!-- Capture fixture only. Copy to pages/tutorial/capture.vue temporarily; never ship this route. -->
<script setup lang="ts">
  import { DiagramAiChatsController, SchemaVersionsController } from '@/lib/controllers';
  import { DatabaseType } from '@/lib/constants/diagram';
  import type { Tables } from '@/types/database';

  const { setLocale } = useI18n();
  await setLocale('en');

  const route = useRoute();
  const project = useCurrentProject();
  const diagramSettings = ref({ show_relation_cardinality: true });

  const schema = {
    tables: [
      {
        id: 'customers',
        name: 'customers',
        color: '#93c5fd',
        position: { x: 80, y: 100 },
        fields: [
          { id: 'customer-id', name: 'id', type: 'serial', primary_key: true },
          { id: 'customer-email', name: 'email', type: 'varchar', unique: true },
          { id: 'customer-name', name: 'name', type: 'varchar' },
        ],
      },
      {
        id: 'orders',
        name: 'orders',
        color: '#c4b5fd',
        position: { x: 480, y: 210 },
        fields: [
          { id: 'order-id', name: 'id', type: 'serial', primary_key: true },
          { id: 'order-customer', name: 'customer_id', type: 'integer' },
          { id: 'order-total', name: 'total', type: 'decimal' },
          { id: 'order-created', name: 'created_at', type: 'timestamp' },
        ],
      },
    ],
    relations: [
      {
        id: 'customer-orders',
        name: 'fk_orders_customer',
        source: 'orders',
        target: 'customers',
        source_field: 'order-customer',
        target_field: 'customer-id',
        source_handle_placement: 'left',
        target_handle_placement: 'right',
        cardinality: { source: 'zero-or-many', target: 'one-and-only-one' },
      },
    ],
    tableGroups: [
      {
        id: 'sales',
        name: 'Sales',
        color: '#93c5fd',
        position: { x: 25, y: 30 },
        width: 790,
        height: 460,
      },
    ],
    notes: [
      {
        id: 'design-note',
        content: 'One customer, many orders.\n\nReview the deletion policy before exporting SQL.',
        color: '#fef3c7',
        position: { x: 150, y: 550 },
        width: 360,
        height: 170,
        rotation: -2,
      },
    ],
  };

  project.state = {
    id: 999999,
    name: 'Shop schema',
    type: DatabaseType.PostgreSQL,
    visibility: 'public',
    team_id: null,
    author: 'tutorial-author',
    share_id: '00000000-0000-4000-8000-000000000001',
    created_at: '2026-10-19T09:00:00Z',
    last_modified_at: '2026-10-19T09:00:00Z',
    schema,
  } as Tables<'projects'>;

  project.editPermission = true;
  project.saved = true;

  SchemaVersionsController.prototype.getByProjectId = async () =>
    [
      {
        id: 'version-2',
        project_id: 999999,
        author_id: 'tutorial-author',
        schema,
        message: 'Customer and order keys reviewed',
        created_at: '2026-10-19T10:00:00Z',
      },
      {
        id: 'version-1',
        project_id: 999999,
        author_id: 'tutorial-author',
        schema,
        message: 'Initial shop schema',
        created_at: '2026-10-18T09:00:00Z',
      },
    ] as Tables<'schema_versions'>[];

  SchemaVersionsController.prototype.getAuthorDisplayNames = async () => [
    { id: 'tutorial-author', display_name: 'Alex Morgan' },
  ];

  DiagramAiChatsController.prototype.getByProjectId = async () =>
    ({
      project_id: 999999,
      messages: [
        {
          id: 'q',
          role: 'user',
          content: 'Explain the relationship and suggest a display name for customers.',
        },
        {
          id: 'a',
          role: 'assistant',
          content:
            '**orders.customer_id** references **customers.id**. Each order belongs to one customer, and a customer can have many orders.\n\nI suggest adding a `display_name` field for the name shown in your application. Review the proposal before applying it.',
        },
        {
          id: 'p',
          role: 'assistant',
          content: '',
          toolInvocations: [
            {
              toolCallId: 'proposal-1',
              toolName: 'proposeSchemaUpdate',
              state: 'result',
              args: {},
              result: {
                proposalId: 'proposal-1',
                mode: 'patch',
                summary:
                  'Add customers.display_name (varchar).\nKeep the existing fields and relationships.',
                proposedSchema: {
                  ...schema,
                  tables: schema.tables.map((table) =>
                    table.id === 'customers'
                      ? {
                          ...table,
                          fields: [
                            ...table.fields,
                            { id: 'display-name', name: 'display_name', type: 'varchar' },
                          ],
                        }
                      : table
                  ),
                },
              },
            },
          ],
        },
      ],
      proposal_states: {},
    }) as unknown as Tables<'diagram_ai_chats'>;
</script>

<template>
  <div v-if="route.query.mode === 'new-project'" class="min-h-screen bg-slate-50 p-12">
    <h1 class="mb-8 text-2xl font-semibold">Projects</h1>
    <HomeCreateDiagramModal />
  </div>
  <div v-else-if="route.query.mode === 'settings'" class="min-h-screen bg-slate-100 p-20">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-3 text-3xl font-bold">Settings</h1>
      <p class="mb-8 text-slate-500">Manage your profile and diagram preferences.</p>
      <section class="rounded-lg border bg-white p-8">
        <h2 class="text-xl font-semibold">Diagram settings</h2>
        <SettingsDiagramSettings v-model="diagramSettings">
          <template #actions><Button>Save</Button></template>
        </SettingsDiagramSettings>
      </section>
    </div>
  </div>
  <div v-else class="flex h-screen flex-col overflow-hidden">
    <DiagramPageHeader />
    <div class="flex min-h-0 flex-1">
      <DiagramSidebar :pending="false" />
      <main class="min-w-0 flex-1"><DiagramCanvas /></main>
    </div>
  </div>
</template>
