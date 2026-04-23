<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PanelType, PanelState } from '../../utils/workspace';
  import Converter from '../../features/converter/Converter.svelte';
  import Formatter from '../../features/formatter/Formatter.svelte';
  import Comparator from '../../features/diff/Comparator.svelte';
  import { Minus, Plus, CopyPlus, Columns, Rows, X } from 'lucide-svelte';
  import Base64Image from '../../features/base64-image/Base64Image.svelte';
  import Minifier from '../../features/minifier/Minifier.svelte';
  import AsciiDetector from '../../features/ascii-detector/AsciiDetector.svelte';
  import Select from '../ui/Select.svelte';
  import Button from '../ui/Button.svelte';

  const dispatch = createEventDispatcher();

  export let panel: PanelState;
  export let isOnlyPanel: boolean = false;

  const tools: { value: PanelType; label: string }[] = [
    { value: 'converter', label: 'Converter' },
    { value: 'formatter', label: 'Formatter' },
    { value: 'comparator', label: 'Comparator' },
    { value: 'base64-image', label: 'Base64 Image' },
    { value: 'minifier', label: 'Minifier' },
    { value: 'ascii-detector', label: 'Special Characters' },
    { value: 'empty', label: 'Empty' },
  ];

  $: zoom = panel.zoom || 1;

  function handleTypeChange(event: CustomEvent<PanelType>) {
    const newType = event.detail;
    if (newType !== panel.type) {
      dispatch('update', { ...panel, type: newType, data: {}, zoom });
    }
  }

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
      
      <!-- Select Dropdown -->
      <div class="w-48 z-50">
        <Select 
          options={tools} 
          value={panel.type} 
          on:change={handleTypeChange}
          class="!border-none !bg-transparent !px-0 !py-0 !text-xs !font-bold hover:!bg-transparent focus:!border-transparent"
        />
      </div>

      <div class="w-[1px] h-4 bg-zinc-800 shrink-0 hidden sm:block"></div>

      <!-- Zoom Controls -->
      <div class="flex items-center space-x-1 h-full shrink-0 hidden sm:flex">
        <Button variant="icon" on:click={() => adjustZoom(-0.1)} title="Zoom Out" ariaLabel="Zoom Out">
          <Minus size={14} strokeWidth={3} />
        </Button>
        
        <Button 
          variant="icon"
          on:click={resetZoom} 
          title="Reset Zoom"
          class="min-w-[36px] !px-1 hover:!text-zinc-200"
        >
          <span class="text-xs font-bold">{Math.round(zoom * 100)}%</span>
        </Button>

        <Button variant="icon" on:click={() => adjustZoom(0.1)} title="Zoom In" ariaLabel="Zoom In">
          <Plus size={14} strokeWidth={3} />
        </Button>
      </div>
    </div>


    <div class="flex items-center space-x-1 shrink-0 ml-2">
      <div class="hidden sm:block">
        <Button variant="icon" on:click={() => dispatch('duplicate')} title="Duplicate Panel" ariaLabel="Duplicate Panel">
          <CopyPlus size={14} strokeWidth={2.5} />
        </Button>
      </div>
      <div class="w-[1px] h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
      <div class="hidden sm:block">
        <Button variant="icon" on:click={() => dispatch('split', { direction: 'vertical' })} title="Split Vertical" ariaLabel="Split Vertical">
          <Columns size={14} strokeWidth={2.5} />
        </Button>
      </div>
      <div class="hidden sm:block">
        <Button variant="icon" on:click={() => dispatch('split', { direction: 'horizontal' })} title="Split Horizontal" ariaLabel="Split Horizontal">
          <Rows size={14} strokeWidth={2.5} />
        </Button>
      </div>
      {#if !isOnlyPanel}
        <div class="w-[1px] h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
        <Button variant="icon" class="hover:!text-red-400" on:click={() => dispatch('remove')} title="Close Panel" ariaLabel="Close Panel">
          <X size={14} strokeWidth={2.5} />
        </Button>
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
  /* Style overrides for the Select component in the header */
  :global(.group\/panel .z-50 button) {
    background-color: transparent !important;
    border-color: transparent !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
