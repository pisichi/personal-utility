import { setContext, getContext } from 'svelte';
import type { WorkspaceState, WorkspaceNode, WorkspaceTab, PanelState } from '../utils/workspace';
import { createInitialState, createDefaultTab, generateId } from '../utils/workspace';

const WORKSPACE_CONTEXT_KEY = Symbol('WORKSPACE');

export class WorkspaceStore {
  state = $state<WorkspaceState>(createInitialState());
  isLoaded = $state(false);

  constructor() {}

  load(savedJson: string | null) {
    if (savedJson) {
      try {
        let parsed = JSON.parse(savedJson);
        if (!parsed.version) {
          parsed.version = 1;
        }
        if (parsed.tabs && parsed.tabs.length > 0) {
          this.state.tabs = parsed.tabs;
          this.state.activeTabId = parsed.activeTabId;
          this.state.version = parsed.version;
        }
      } catch (e) {
        console.error("Failed to load tabs", e);
      }
    }

    if (!this.state.activeTabId || !this.state.tabs.find((t: WorkspaceTab) => t.id === this.state.activeTabId)) {
      if (this.state.tabs.length > 0) {
        this.state.activeTabId = this.state.tabs[0].id;
      }
    }
    
    this.isLoaded = true;
  }

  get activeTab(): WorkspaceTab {
    return this.state.tabs.find((t: WorkspaceTab) => t.id === this.state.activeTabId) || this.state.tabs[0];
  }

  addTab() {
    const newTab = createDefaultTab(`Tab ${this.state.tabs.length + 1}`);
    this.state.tabs.push(newTab);
    this.state.activeTabId = newTab.id;
  }

  selectTab(id: string) {
    this.state.activeTabId = id;
  }

  removeTab(id: string) {
    if (this.state.tabs.length <= 1) return;
    const idx = this.state.tabs.findIndex((t: WorkspaceTab) => t.id === id);
    const wasActive = this.state.activeTabId === id;
    
    this.state.tabs.splice(idx, 1);
    if (wasActive) {
      this.state.activeTabId = this.state.tabs[Math.max(0, idx - 1)].id;
    }
  }

  renameTab(id: string, name: string) {
    const tab = this.state.tabs.find((t: WorkspaceTab) => t.id === id);
    if (tab) {
      tab.name = name;
    }
  }

  // Node operations using a helper to find the parent
  findParentNode(nodeId: string, currentNode: WorkspaceNode = this.activeTab.layout): WorkspaceNode | null {
    if (currentNode.children) {
      if (currentNode.children[0].id === nodeId || currentNode.children[1].id === nodeId) {
        return currentNode;
      }
      return this.findParentNode(nodeId, currentNode.children[0]) || this.findParentNode(nodeId, currentNode.children[1]);
    }
    return null;
  }

  updatePanel(node: WorkspaceNode, panel: PanelState) {
      node.panel = panel;
  }

  splitNode(node: WorkspaceNode, direction: 'horizontal' | 'vertical') {
    const originalType = node.type;
    const originalPanel = $state.snapshot(node.panel);

    node.type = 'split';
    node.direction = direction;
    node.percentage = 50;
    node.panel = undefined;
    
    node.children = [
      { id: generateId(), type: originalType, panel: originalPanel },
      { id: generateId(), type: 'panel', panel: { id: generateId(), type: 'empty', data: {} } as PanelState }
    ];
  }

  removeNode(nodeId: string) {
    const parent = this.findParentNode(nodeId);
    if (parent && parent.children) {
      const remainingChild = parent.children[0].id === nodeId ? parent.children[1] : parent.children[0];
      // Replace parent with remaining child
      parent.type = remainingChild.type;
      parent.panel = remainingChild.panel;
      parent.direction = remainingChild.direction;
      parent.percentage = remainingChild.percentage;
      parent.children = remainingChild.children;
    }
  }

  duplicateNode(node: WorkspaceNode) {
    if (node.panel) {
      this.splitNode(node, 'vertical');
      if (node.children) {
        // Deep copy the panel to the new child
        node.children[1].panel = { ...$state.snapshot(node.children[0].panel), id: generateId() } as PanelState;
      }
    }
  }
}

export function setWorkspaceStore() {
  const store = new WorkspaceStore();
  setContext(WORKSPACE_CONTEXT_KEY, store);
  return store;
}

export function getWorkspaceStore(): WorkspaceStore {
  return getContext(WORKSPACE_CONTEXT_KEY);
}
