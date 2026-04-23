<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { backOut, quintOut } from 'svelte/easing';
  import { Plus, X } from 'lucide-svelte';
  import { getWorkspaceStore } from '../../stores/workspace.svelte';
  import Button from '../ui/Button.svelte';

  const store = getWorkspaceStore();

  let editingTabId: string | null = null;

  function focusOnInit(node: HTMLInputElement) {
    node.focus();
  }
</script>

<div class="flex items-end bg-[#09090b] border-b border-zinc-700 px-3 h-10 overflow-hidden select-none shrink-0" role="tablist" aria-label="Workspace tabs">
  <!-- Brand -->
  <div class="flex items-center pr-4 border-r border-zinc-800 mr-3 h-full">
    <span class="text-xs font-black text-zinc-300 tracking-[0.1em] uppercase">Utility::Toolkit</span>
  </div>

  <div class="flex-1 flex items-end h-full overflow-x-auto no-scrollbar space-x-[1px]">
    {#each store.state.tabs as tab (tab.id)}
      <div 
        animate:flip={{ duration: 300, easing: quintOut }}
        in:fly={{ x: 30, duration: 400, easing: backOut }}
        out:fade={{ duration: 200 }}
        role="tab"
        aria-selected={tab.id === store.state.activeTabId}
        tabindex="0"
        on:click={() => store.selectTab(tab.id)}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && store.selectTab(tab.id)}
        on:dblclick={() => editingTabId = tab.id}
        class="flex items-center h-8 px-4 rounded-t-sm border-x border-t transition-all cursor-pointer min-w-[120px] max-w-[200px] group outline-none relative
               {tab.id === store.state.activeTabId 
                 ? 'bg-[#121214] border-zinc-700 text-zinc-100 z-10 bottom-[-1px] pb-[1px]' 
                 : 'bg-zinc-900/50 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80'}"
      >
        {#if editingTabId === tab.id}
          <input 
            use:focusOnInit
            value={tab.name}
            on:blur={(e) => {
              const name = e.currentTarget.value.trim();
              if (name) store.renameTab(tab.id, name);
              editingTabId = null;
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') editingTabId = null;
            }}
            class="bg-zinc-800 text-zinc-100 text-xs font-bold uppercase tracking-wider outline-none w-full px-1 rounded-sm border border-zinc-500"
            aria-label="Rename tab"
          />
        {:else}
          <span class="text-xs font-bold uppercase tracking-widest truncate flex-1 pointer-events-none">
            {tab.name}
          </span>
          {#if store.state.tabs.length > 1}
            <Button variant="custom"
              on:click={(e) => { e.stopPropagation(); store.removeTab(tab.id); }}
              class="ml-2 p-0.5 bg-transparent border-none text-zinc-500 hover:text-zinc-200 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              ariaLabel="Close tab"
              title="Close Tab"
            >
              <X size={12} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          {/if}
        {/if}
      </div>
    {/each}

    <Button variant="custom"
      on:click={() => store.addTab()}
      class="flex items-center justify-center h-8 w-8 mb-0 ml-1 rounded-t-sm hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-all shrink-0 cursor-pointer border-none bg-transparent"
      ariaLabel="Add new workspace tab"
      title="New Workspace"
    >
      <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
    </Button>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
>
