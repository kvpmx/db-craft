import DiagramTablesPanel from './tables-panel.vue';
import DiagramRelationsPanel from './relations-panel.vue';

import type { Component } from 'vue';

export type DiagramSidebarTab = 'tables' | 'relations';

export type DiagramSidebarTabConfig = {
  id: DiagramSidebarTab;
  labelKey: string;
  icon: string;
  component: Component;
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
];

export const SIDEBAR_WIDTH = 400;
export const SIDEBAR_TOOLBAR_WIDTH = 44;
