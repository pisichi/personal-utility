<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { backOut, quintOut } from 'svelte/easing';
  import type { WorkspaceTab } from '../../utils/workspace';
  import { Plus, X } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let tabs: WorkspaceTab[];
  export let activeTabId: string;

  let editingTabId: string | null = null;

  function reset() {
    if (confirm("Reset layout to default?")) {
      localStorage.removeItem('personal-utility-v3');
      window.location.reload();
    }
  }

  function focusOnInit(node: HTMLInputElement) {
    node.focus();
  }
</script>

<div class="flex items-center bg-[#09090b] border-b border-zinc-800 px-3 h-10 overflow-hidden select-none shrink-0" role="tablist" aria-label="Workspace tabs">
  <!-- Brand -->
  <div class="flex items-center pr-4 border-r border-zinc-800 mr-2 h-full">
    <span class="text-[10px] font-black text-zinc-100 tracking-[0.25em] uppercase">Utility::Toolkit</span>
  </div>

  <!-- Tabs -->
  <div class="flex-1 flex items-end h-full overflow-x-auto no-scrollbar space-x-1">
    {#each tabs as tab (tab.id)}
      <div 
        animate:flip={{ duration: 300, easing: quintOut }}
        in:fly={{ x: 30, duration: 400, easing: backOut }}
        out:fade={{ duration: 200 }}
        role="tab"
        aria-selected={tab.id === activeTabId}
        tabindex="0"
        on:click={() => dispatch('select', tab.id)}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch('select', tab.id)}
        on:dblclick={() => editingTabId = tab.id}
        class="flex items-center h-8 px-3 rounded-t-md border-x border-t transition-all cursor-pointer min-w-[100px] max-w-[180px] group outline-none
               {tab.id === activeTabId 
                 ? 'bg-[#121214] border-zinc-700 text-zinc-100 z-10' 
                 : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}"
      >
        {#if editingTabId === tab.id}
          <input 
            use:focusOnInit
            value={tab.name}
            on:blur={(e) => {
              const name = e.currentTarget.value.trim();
              if (name) dispatch('rename', { id: tab.id, name });
              editingTabId = null;
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') editingTabId = null;
            }}
            class="bg-zinc-800 text-zinc-100 text-[10px] font-bold uppercase tracking-wider outline-none w-full px-1 rounded-sm border border-[#F5A623]"
            aria-label="Rename tab"
          />
        {:else}
          <span class="text-[10px] font-bold uppercase tracking-widest truncate flex-1 pointer-events-none">
            {tab.name}
          </span>
          {#if tabs.length > 1}
            <button 
              on:click|stopPropagation={() => dispatch('remove', tab.id)}
              class="ml-2 p-0.5 bg-transparent border-none text-zinc-500 hover:text-red-500 transition-all flex items-center justify-center shrink-0"
              aria-label="Close tab"
              title="Close Tab"
            >
              <X size={12} strokeWidth={2.5} class="shrink-0" />
            </button>
          {/if}
        {/if}
      </div>
    {/each}

    <!-- Add Tab Button -->
    <button 
      on:click={() => dispatch('add')}
      class="flex items-center justify-center h-7 w-7 mb-1 ml-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-[#F5A623] transition-all shrink-0 shadow-sm border border-zinc-700 active:scale-90"
      aria-label="Add new workspace tab"
      title="New Workspace"
    >
      <Plus size={16} strokeWidth={2.5} class="shrink-0" />
    </button>
  </div>

  <!-- Global Actions -->
  <div class="flex items-center pl-4 border-l border-zinc-800 ml-2 h-full space-x-3">
    <button on:click={reset} class="text-[9px] font-bold text-zinc-600 hover:text-red-400 uppercase tracking-widest transition-colors">Reset</button>
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
