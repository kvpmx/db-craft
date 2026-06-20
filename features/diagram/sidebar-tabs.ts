import DiagramAiPanel from './ai-panel.vue';
import DiagramTablesPanel from './tables-panel.vue';
import DiagramRelationsPanel from './relations-panel.vue';

import type { Component } from 'vue';

export type DiagramSidebarTab = 'tables' | 'relations' | 'ai';

export type DiagramSidebarTabConfig = {
  id: DiagramSidebarTab;
  labelKey: string;
  icon: string;
  component: Component;
  requiresEdit?: boolean;
};

export const DIAGRAM_SIDEBAR_TABS: readonly DiagramSidebarTabConfig[] = [
  {
    id: 'tables',
    labelKey: 'TABLES',
    icon: 'lucide:table-2',
    component: DiagramTablesPanel,
  },
  {
    id: 'relations',
    labelKey: 'RELATIONS',
    icon: 'lucide:git-branch',
    component: DiagramRelationsPanel,
  },
  {
    id: 'ai',
    labelKey: 'AI',
    icon: 'hugeicons:ai-magic',
    component: DiagramAiPanel,
    requiresEdit: true,
  },
];

export const SIDEBAR_WIDTH = 400;
export const SIDEBAR_TOOLBAR_WIDTH = 44;
export const SIDEBAR_TOOLBAR_ITEM_HEIGHT_CLASS = 'h-[calc(2.75rem+1px)]';
export const SIDEBAR_PANEL_HEADER_CLASS = `flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-3 ${SIDEBAR_TOOLBAR_ITEM_HEIGHT_CLASS}`;
