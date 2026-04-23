<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SplitNode from './SplitNode.svelte';
  import WorkspaceTabs from './WorkspaceTabs.svelte';
  import { setWorkspaceStore } from '../../stores/workspace.svelte';

  const STORAGE_KEY = 'personal-utility-v3';

  const store = setWorkspaceStore();

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    store.load(saved);
  });

  $effect(() => {
    if (store.isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: store.state.version,
        tabs: store.state.tabs,
        activeTabId: store.state.activeTabId
      }));
    }
  });

</script>

<div class="flex flex-col w-full h-full bg-[#09090b] overflow-hidden">
  {#if store.isLoaded}
    <WorkspaceTabs />
    
    <div class="flex-1 min-h-0 relative overflow-hidden bg-zinc-950">
      {#key store.state.activeTabId}
        <div 
          in:fly={{ y: 5, duration: 400, easing: quintOut }}
          out:fade={{ duration: 150 }}
          class="w-full h-full absolute top-0 left-0"
        >
          <SplitNode 
            node={store.activeTab.layout} 
            isRoot={true}
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
