<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { WorkspaceState, WorkspaceNode, WorkspaceTab } from '../../utils/workspace';
  import { createInitialState, createDefaultTab } from '../../utils/workspace';
  import SplitNode from './SplitNode.svelte';
  import WorkspaceTabs from './WorkspaceTabs.svelte';

  const STORAGE_KEY = 'personal-utility-v3';

  // Svelte 5 runes for guaranteed reactivity
  let state = $state<WorkspaceState>(createInitialState());
  let isLoaded = $state(false);

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tabs && parsed.tabs.length > 0) {
          state.tabs = parsed.tabs;
          state.activeTabId = parsed.activeTabId;
        }
      } catch (e) {
        console.error("Failed to load tabs", e);
      }
    }
    
    if (!state.activeTabId || !state.tabs.find((t: WorkspaceTab) => t.id === state.activeTabId)) {
      if (state.tabs.length > 0) {
        state.activeTabId = state.tabs[0].id;
      }
    }
    
    isLoaded = true;
  });

  // Effect handles all persistence automatically
  $effect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tabs: state.tabs,
        activeTabId: state.activeTabId
      }));
    }
  });

  // Derived state for the current view
  const activeTab = $derived(
    state.tabs.find((t: WorkspaceTab) => t.id === state.activeTabId) || state.tabs[0]
  );

  function handleLayoutUpdate(node: WorkspaceNode) {
    const idx = state.tabs.findIndex((t: WorkspaceTab) => t.id === state.activeTabId);
    if (idx !== -1) {
      state.tabs[idx].layout = node;
    }
  }

  function addTab() {
    const newTab = createDefaultTab(`Tab ${state.tabs.length + 1}`);
    state.tabs.push(newTab);
    state.activeTabId = newTab.id;
  }

  function selectTab(id: string) {
    state.activeTabId = id;
  }

  function removeTab(id: string) {
    if (state.tabs.length <= 1) return;
    const idx = state.tabs.findIndex((t: WorkspaceTab) => t.id === id);
    const wasActive = state.activeTabId === id;
    
    state.tabs.splice(idx, 1);
    if (wasActive) {
      state.activeTabId = state.tabs[Math.max(0, idx - 1)].id;
    }
  }

  function renameTab(id: string, name: string) {
    const tab = state.tabs.find((t: WorkspaceTab) => t.id === id);
    if (tab) {
      tab.name = name;
    }
  }
</script>

<div class="flex flex-col w-full h-full bg-[#09090b] overflow-hidden">
  {#if isLoaded}
    <WorkspaceTabs 
      tabs={state.tabs} 
      activeTabId={state.activeTabId}
      on:add={addTab}
      on:select={(e) => selectTab(e.detail)}
      on:remove={(e) => removeTab(e.detail)}
      on:rename={(e) => renameTab(e.detail.id, e.detail.name)}
    />
    
    <div class="flex-1 min-h-0 relative overflow-hidden bg-zinc-950">
      {#key state.activeTabId}
        <div 
          in:fly={{ y: 5, duration: 400, easing: quintOut }}
          out:fade={{ duration: 150 }}
          class="w-full h-full absolute top-0 left-0"
        >
          <SplitNode 
            node={activeTab.layout} 
            isRoot={true}
            on:update={(e) => handleLayoutUpdate(e.detail)} 
          />
        </div>
      {/key}
    </div>
  {:else}
    <div class="w-full h-full flex items-center justify-center bg-[#09090b]">
       <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Loading Workspace...</span>
    </div>
  {/if}
</div>
