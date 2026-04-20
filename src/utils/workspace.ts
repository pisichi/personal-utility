export type PanelType = 'converter' | 'formatter' | 'comparator' | 'base64-image' | 'minifier' | 'ascii-detector' | 'empty';

export interface PanelState {
  id: string;
  type: PanelType;
  data: any;
  zoom?: number;
}

export interface WorkspaceNode {
  id: string;
  type: 'split' | 'panel';
  direction?: 'horizontal' | 'vertical';
  percentage?: number;
  children?: [WorkspaceNode, WorkspaceNode];
  panel?: PanelState;
}

export interface WorkspaceTab {
  id: string;
  name: string;
  layout: WorkspaceNode;
}

export interface WorkspaceState {
  tabs: WorkspaceTab[];
  activeTabId: string;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const createDefaultLayout = (): WorkspaceNode => ({
  id: generateId(),
  type: 'panel',
  panel: {
    id: generateId(),
    type: 'converter',
    data: {},
    zoom: 1
  }
});

export const createDefaultTab = (name = "Workspace"): WorkspaceTab => ({
  id: generateId(),
  name,
  layout: createDefaultLayout()
});

export const createInitialState = (): WorkspaceState => {
  const mainTab = createDefaultTab("Main");
  return {
    tabs: [mainTab],
    activeTabId: mainTab.id
  };
};
