<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PanelType, PanelState } from '../../utils/workspace';
  import Converter from '../../features/converter/Converter.svelte';
  import Formatter from '../../features/formatter/Formatter.svelte';
  import Comparator from '../../features/diff/Comparator.svelte';
  import { 
    ChevronDown, 
    CopyPlus, 
    Columns, 
    Rows, 
    X, 
    Minus, 
    Plus 
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let panel: PanelState;
  export let isOnlyPanel: boolean = false;

  const tools: { value: PanelType; label: string }[] = [
    { value: 'converter', label: 'Converter' },
    { value: 'formatter', label: 'Formatter' },
    { value: 'comparator', label: 'Comparator' },
    { value: 'empty', label: 'Empty' },
  ];

  $: zoom = panel.zoom || 1;

  function handleUpdate(event: CustomEvent) {
    dispatch('update', { ...panel, data: event.detail, zoom });
  }

  function handleTypeChange(e: Event) {
    const newType = (e.target as HTMLSelectElement).value as PanelType;
    dispatch('update', { ...panel, type: newType, data: {}, zoom });
  }

  function adjustZoom(delta: number) {
    const newZoom = Math.round(Math.max(0.3, Math.min(3.0, zoom + delta)) * 10) / 10;
    if (newZoom !== zoom) {
      dispatch('update', { ...panel, zoom: newZoom });
    }
  }

  function resetZoom() {
    dispatch('update', { ...panel, zoom: 1 });
  }
</script>

<div class="flex flex-col h-full w-full bg-[#121214] rounded-sm border border-zinc-700 shadow-sm overflow-hidden group/panel min-h-0 min-w-0">
  <!-- Sharp Header -->
  <div class="flex items-center justify-between h-8 px-2 bg-zinc-900 border-b border-zinc-700 shrink-0 select-none relative z-50">
    <div class="flex items-center h-full space-x-3">
      <!-- Tool Selector -->
      <div class="flex items-center h-full relative group/select">
        <label for="tool-select-{panel.id}" class="sr-only">Select Tool</label>
        <select 
          id="tool-select-{panel.id}"
          value={panel.type} 
          on:change={handleTypeChange}
          class="bg-transparent border-none text-[10px] font-bold text-zinc-100 group-hover/select:text-blue-400 transition-colors outline-none cursor-pointer p-0 pr-4 appearance-none uppercase tracking-widest z-10"
        >
          {#each tools as tool}
            <option value={tool.value} class="bg-zinc-900 text-zinc-300">{tool.label}</option>
          {/each}
        </select>
        <div class="absolute right-0 text-zinc-500 group-hover/select:text-blue-400 pointer-events-none transition-colors">
          <ChevronDown size={10} strokeWidth={3} />
        </div>
      </div>

      <div class="w-[1px] h-3 bg-zinc-800"></div>

      <!-- Zoom Controls -->
      <div class="flex items-center space-x-1 h-full">
        <button 
          on:click={() => adjustZoom(-0.1)} 
          title="Zoom Out" 
          aria-label="Zoom Out"
          class="flex items-center justify-center w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-all shadow-sm"
        >
          <Minus size={12} strokeWidth={2.5} />
        </button>
        
        <button 
          on:click={resetZoom} 
          title="Reset Zoom" 
          aria-label="Reset Zoom"
          class="text-[9px] font-bold text-zinc-400 hover:text-blue-400 px-1 transition-colors min-w-[32px] flex items-center justify-center"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button 
          on:click={() => adjustZoom(0.1)} 
          title="Zoom In" 
          aria-label="Zoom In"
          class="flex items-center justify-center w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-all shadow-sm"
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-1">
      <button on:click={() => dispatch('duplicate')} title="Duplicate Panel" aria-label="Duplicate Panel" class="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-blue-400 transition-all shadow-sm">
        <CopyPlus size={14} strokeWidth={2} />
      </button>
      <div class="w-[1px] h-3 bg-zinc-800 mx-0.5"></div>
      <button on:click={() => dispatch('split', { direction: 'vertical' })} title="Split Vertical" aria-label="Split Vertical" class="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-blue-400 transition-all shadow-sm">
        <Columns size={14} strokeWidth={2} />
      </button>
      <button on:click={() => dispatch('split', { direction: 'horizontal' })} title="Split Horizontal" aria-label="Split Horizontal" class="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-blue-400 transition-all shadow-sm">
        <Rows size={14} strokeWidth={2} />
      </button>
      {#if !isOnlyPanel}
        <div class="w-[1px] h-3 bg-zinc-800 mx-0.5"></div>
        <button on:click={() => dispatch('remove')} title="Close Panel" aria-label="Close Panel" class="p-1 rounded bg-red-900/40 text-zinc-300 hover:text-white hover:bg-red-900 transition-all shadow-sm">
          <X size={14} strokeWidth={2.5} />
        </button>
      {/if}
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 min-h-0 relative bg-[#121214] overflow-auto no-scrollbar z-10">
    <div 
      style="transform: scale({zoom}); transform-origin: top left; width: {100/zoom}%; height: {100/zoom}%; min-height: 100%;" 
      class="flex flex-col p-3 min-h-full"
    >
      <div class="flex-1 flex flex-col min-h-0">
        {#if panel.type === 'converter'}
          <Converter initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'formatter'}
          <Formatter initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'comparator'}
          <Comparator initialData={panel.data} on:update={handleUpdate} />
        {:else}
          <div class="h-full flex-1 flex flex-col items-center justify-center opacity-20">
            <span class="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-100">Select Tool Above</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
