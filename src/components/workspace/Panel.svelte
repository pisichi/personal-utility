<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { PanelType, PanelState } from '../../utils/workspace';
  import Converter from '../../features/converter/Converter.svelte';
  import Formatter from '../../features/formatter/Formatter.svelte';
  import Comparator from '../../features/diff/Comparator.svelte';
  import { ChevronDown, Minus, Plus, CopyPlus, Columns, Rows, X } from 'lucide-svelte';
  import Base64Image from '../../features/base64-image/Base64Image.svelte';
  import Minifier from '../../features/minifier/Minifier.svelte';
  import AsciiDetector from '../../features/ascii-detector/AsciiDetector.svelte';

  const dispatch = createEventDispatcher();

  export let panel: PanelState;
  export let isOnlyPanel: boolean = false;

  const tools: { value: PanelType; label: string }[] = [
    { value: 'converter', label: 'Converter' },
    { value: 'formatter', label: 'Formatter' },
    { value: 'comparator', label: 'Comparator' },
    { value: 'base64-image', label: 'Base64 Image' },
    { value: 'minifier', label: 'Minifier' },
    { value: 'ascii-detector', label: 'Ascii Detector' },
    { value: 'empty', label: 'Empty' },
  ];

  $: zoom = panel.zoom || 1;
  $: currentToolLabel = tools.find(t => t.value === panel.type)?.label || 'Select Tool';

  let isDropdownOpen = false;
  let dropdownRef: HTMLDivElement;

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function handleTypeChange(newType: PanelType) {
    isDropdownOpen = false;
    if (newType !== panel.type) {
      dispatch('update', { ...panel, type: newType, data: {}, zoom });
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isDropdownOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function handleUpdate(event: CustomEvent) {
    dispatch('update', { ...panel, data: event.detail, zoom });
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

<div class="flex flex-col h-full w-full bg-[#121214] rounded-sm border border-zinc-700 shadow-sm group/panel min-h-0 min-w-0">
  <!-- Sharp Header -->
  <div class="flex items-center justify-between h-9 px-3 bg-zinc-900 border-b border-zinc-700 shrink-0 select-none relative z-50 rounded-t-[1px]">
    <div class="flex items-center h-full space-x-4 min-w-0 flex-1">
      
      <!-- Custom Animated Dropdown -->
      <div class="relative h-full flex items-center shrink-0" bind:this={dropdownRef}>
        <button 
          on:click|stopPropagation={toggleDropdown}
          class="flex items-center space-x-2 bg-transparent border-none text-xs font-bold text-zinc-300 hover:text-zinc-100 transition-colors outline-none cursor-pointer p-0 uppercase tracking-widest z-10"
        >
          <span>{currentToolLabel}</span>
          <div class="text-zinc-500 group-hover/select:text-zinc-300 pointer-events-none transition-transform duration-200 {isDropdownOpen ? 'rotate-180 text-zinc-300' : ''}">
            <ChevronDown size={12} strokeWidth={3} />
          </div>
        </button>

        {#if isDropdownOpen}
          <div 
            transition:slide={{ duration: 200, easing: cubicOut }}
            class="absolute top-full left-0 mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-sm shadow-lg overflow-hidden z-50"
          >
            <div class="flex flex-col py-1">
              {#each tools as tool}
                <button 
                  on:click|stopPropagation={() => handleTypeChange(tool.value)}
                  class="flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer border-none text-left transition-colors w-full
                         {panel.type === tool.value ? 'bg-zinc-700 text-zinc-100' : 'bg-transparent text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'}"
                >
                  {tool.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="w-[1px] h-4 bg-zinc-800 shrink-0 hidden sm:block"></div>

      <!-- Zoom Controls -->
      <div class="flex items-center space-x-1 h-full shrink-0 hidden sm:flex">
        <button 
          on:click={() => adjustZoom(-0.1)} 
          title="Zoom Out" 
          aria-label="Zoom Out"
          class="flex items-center justify-center w-6 h-6 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border-none"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        
        <button 
          on:click={resetZoom} 
          title="Reset Zoom" 
          aria-label="Reset Zoom"
          class="text-xs font-bold text-zinc-400 hover:text-zinc-200 px-1 transition-colors min-w-[36px] flex items-center justify-center bg-transparent border-none cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button 
          on:click={() => adjustZoom(0.1)} 
          title="Zoom In" 
          aria-label="Zoom In"
          class="flex items-center justify-center w-6 h-6 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border-none"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>


    <div class="flex items-center space-x-1 shrink-0 ml-2">
      <button on:click={() => dispatch('duplicate')} title="Duplicate Panel" aria-label="Duplicate Panel" class="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border-none hidden sm:block">
        <CopyPlus size={14} strokeWidth={2.5} />
      </button>
      <div class="w-[1px] h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
      <button on:click={() => dispatch('split', { direction: 'vertical' })} title="Split Vertical" aria-label="Split Vertical" class="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border-none hidden sm:block">
        <Columns size={14} strokeWidth={2.5} />
      </button>
      <button on:click={() => dispatch('split', { direction: 'horizontal' })} title="Split Horizontal" aria-label="Split Horizontal" class="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border-none hidden sm:block">
        <Rows size={14} strokeWidth={2.5} />
      </button>
      {#if !isOnlyPanel}
        <div class="w-[1px] h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
        <button on:click={() => dispatch('remove')} title="Close Panel" aria-label="Close Panel" class="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-all cursor-pointer border-none">
          <X size={14} strokeWidth={2.5} />
        </button>
      {/if}
    </div>
  </div>

  <div class="flex-1 min-h-0 relative bg-[#121214] overflow-auto no-scrollbar z-10">
    <div 
      style="transform: scale({zoom}); transform-origin: top left; width: {100/zoom}%; height: {100/zoom}%; min-height: 100%;" 
      class="flex flex-col p-4 min-h-full"
    >
      <div class="flex-1 flex flex-col min-h-[100px]">
        {#if panel.type === 'converter'}
          <Converter initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'formatter'}
          <Formatter initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'comparator'}
          <Comparator initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'base64-image'}
          <Base64Image initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'minifier'}
          <Minifier initialData={panel.data} on:update={handleUpdate} />
        {:else if panel.type === 'ascii-detector'}
          <AsciiDetector initialData={panel.data} on:update={handleUpdate} />
        {:else}
          <div class="h-full flex-1 flex flex-col items-center justify-center opacity-30">
            <span class="text-sm font-bold uppercase tracking-[0.4em] text-zinc-300">Select Tool Above</span>
          </div>
        {/if}
      </div>
    </div>
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