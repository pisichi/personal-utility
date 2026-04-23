export type PanelType = 'converter' | 'formatter' | 'comparator' | 'base64-image' | 'minifier' | 'ascii-detector' | 'empty';

export interface BasePanelState {
  id: string;
  type: PanelType;
  zoom?: number;
}

export interface ConverterData {
  formatType?: 'base64' | 'unicode' | 'url';
  encodeInput?: string;
  decodeInput?: string;
}

export interface FormatterData {
  input?: string;
  formatType?: 'json' | 'xml' | 'auto';
  decodeOrgMsg?: boolean;
}

export interface ComparatorData {
  original?: string;
  modified?: string;
}

export interface Base64ImageData {
  base64?: string;
}

export interface MinifierData {
  input?: string;
}

export interface AsciiDetectorData {
  input?: string;
  detectUtf8?: boolean;
}

export type PanelDataMap = {
  'converter': ConverterData;
  'formatter': FormatterData;
  'comparator': ComparatorData;
  'base64-image': Base64ImageData;
  'minifier': MinifierData;
  'ascii-detector': AsciiDetectorData;
  'empty': Record<string, never>;
};

export type PanelState = {
  [K in PanelType]: BasePanelState & {
    type: K;
    data: PanelDataMap[K];
  }
}[PanelType];

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
  version: number;
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
  } as PanelState
});

export const createDefaultTab = (name = "Workspace"): WorkspaceTab => ({
  id: generateId(),
  name,
  layout: createDefaultLayout()
});

export const createInitialState = (): WorkspaceState => {
  const mainTab = createDefaultTab("Main");
  return {
    version: 1,
    tabs: [mainTab],
    activeTabId: mainTab.id
  };
};
