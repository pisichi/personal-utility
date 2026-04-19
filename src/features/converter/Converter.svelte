<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import { convert } from './converter';
  import { ChevronDown } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let initialData: any = {};

  type FormatType = 'base64' | 'unicode' | 'url';

  let formatType: FormatType = initialData.formatType || 'base64';
  let encodeInput: string = initialData.encodeInput || '';
  let decodeInput: string = initialData.decodeInput || '';

  let encodeOutput: string = '';
  let encodeErrorMsg: string = '';
  let encodeCopyFeedback = false;

  let decodeOutput: string = '';
  let decodeErrorMsg: string = '';
  let decodeCopyFeedback = false;

  const formats = [
    { value: 'base64', label: 'Base64' },
    { value: 'unicode', label: 'Unicode' },
    { value: 'url', label: 'URL Encode' },
  ];

  $: currentFormatLabel = formats.find(f => f.value === formatType)?.label || 'Base64';

  let isFormatDropdownOpen = false;
  let formatDropdownRef: HTMLDivElement;

  function toggleFormatDropdown() {
    isFormatDropdownOpen = !isFormatDropdownOpen;
  }

  function handleFormatChange(newFormat: FormatType) {
    isFormatDropdownOpen = false;
    formatType = newFormat;
  }

  function handleClickOutside(event: MouseEvent) {
    if (formatDropdownRef && !formatDropdownRef.contains(event.target as Node)) {
      isFormatDropdownOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function copy(text: string, side: 'encode' | 'decode') {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        if (side === 'encode') {
          encodeCopyFeedback = true;
          setTimeout(() => (encodeCopyFeedback = false), 2000);
        } else {
          decodeCopyFeedback = true;
          setTimeout(() => (decodeCopyFeedback = false), 2000);
        }
      });
    }
  }

  function clear(side: 'encode' | 'decode') {
    if (side === 'encode') {
      encodeInput = '';
    } else {
      decodeInput = '';
    }
  }

  // Notify parent of state changes
  $: {
    dispatch('update', {
      formatType,
      encodeInput,
      decodeInput
    });
  }

  $: {
    try {
      encodeErrorMsg = '';
      const type = `string-to-${formatType}` as any;
      encodeOutput = convert(encodeInput, type);
    } catch (error) {
      encodeErrorMsg = error instanceof Error ? error.message : 'Encoding failed';
      encodeOutput = '';
    }
  }

  $: {
    try {
      decodeErrorMsg = '';
      const type = `${formatType}-to-string` as any;
      decodeOutput = convert(decodeInput, type);
    } catch (error) {
      decodeErrorMsg = error instanceof Error ? error.message : 'Decoding failed';
      decodeOutput = '';
    }
  }

  const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="space-y-8 flex flex-col h-full min-h-0">
  <!-- Format Type Selector -->
  <div class="shrink-0 flex items-center space-x-4">
    <div class="flex-1 max-w-sm relative z-40">
      <label for="format-{instanceId}" class="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest opacity-80">Conversion Format</label>
      
      <!-- Custom Animated Dropdown -->
      <div class="relative w-full" bind:this={formatDropdownRef}>
        <button 
          id="format-{instanceId}"
          on:click|stopPropagation={toggleFormatDropdown}
          class="flex items-center justify-between w-full border border-zinc-700 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm px-3 py-2 transition-colors outline-none focus:border-zinc-500 cursor-pointer"
        >
          <span>{currentFormatLabel}</span>
          <ChevronDown 
            size={14} 
            strokeWidth={3} 
            class="text-zinc-500 transition-transform duration-200 {isFormatDropdownOpen ? 'rotate-180 text-zinc-300' : ''}" 
          />
        </button>

        {#if isFormatDropdownOpen}
          <div 
            transition:slide={{ duration: 200, easing: cubicOut }}
            class="absolute top-full left-0 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-sm shadow-lg overflow-hidden z-50"
          >
            <div class="flex flex-col py-1">
              {#each formats as fmt}
                <button 
                  on:click|stopPropagation={() => handleFormatChange(fmt.value as FormatType)}
                  class="flex items-center px-3 py-2 text-sm font-medium cursor-pointer border-none text-left transition-colors w-full
                         {formatType === fmt.value ? 'bg-zinc-700 text-zinc-100' : 'bg-transparent text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100'}"
                >
                  {fmt.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-0 z-10 relative">
    <!-- ENCODE Section -->
    <div class="flex flex-col min-h-0 border-r border-zinc-800/50 pr-4 xl:pr-8 last:border-0 last:pr-0">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0 mb-4">
        <h3 class="text-sm font-bold text-zinc-300 uppercase tracking-widest">Encode</h3>
        <span class="text-xs text-zinc-500 font-mono">TEXT → {formatType.toUpperCase()}</span>
      </div>
      
      <div class="flex-1 grid grid-rows-2 gap-6 min-h-0">
        <!-- Input -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="encode-in-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Source Text</label>
            <button on:click={() => clear('encode')} class="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm transition-colors text-xs text-zinc-300 uppercase font-bold tracking-tighter shadow-sm cursor-pointer">
              <span>Clear</span>
            </button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34] shadow-inner">
            <CodeEditor bind:value={encodeInput} id="encode-in-{instanceId}" lang="text" />
          </div>
        </div>


        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="encode-out-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Result</label>
            <button 
              on:click={() => copy(encodeOutput, 'encode')}
              disabled={!encodeOutput}
              class="flex items-center space-x-2 px-3 py-1.5 transition-all text-xs text-zinc-300 uppercase font-bold tracking-tighter rounded-sm shadow-sm border cursor-pointer {encodeCopyFeedback ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed'}"
            >
              {#if encodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden bg-[#282c34] flex-1 min-h-0 shadow-inner">
            <CodeEditor value={encodeOutput} id="encode-out-{instanceId}" lang="text" readonly={true} />
          </div>
          {#if encodeErrorMsg}
            <div class="mt-2 text-zinc-400 text-xs font-mono shrink-0 p-2 bg-zinc-800 border border-zinc-700 rounded-sm">{encodeErrorMsg}</div>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex flex-col min-h-0">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0 mb-4">
        <h3 class="text-sm font-bold text-zinc-300 uppercase tracking-widest">Decode</h3>
        <span class="text-xs text-zinc-500 font-mono">{formatType.toUpperCase()} → TEXT</span>
      </div>
      
      <div class="flex-1 grid grid-rows-2 gap-6 min-h-0">
        <!-- Input -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="decode-in-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Encoded Content</label>
            <button on:click={() => clear('decode')} class="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm transition-colors text-xs text-zinc-300 uppercase font-bold tracking-tighter shadow-sm cursor-pointer">
              <span>Clear</span>
            </button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34] shadow-inner">
            <CodeEditor bind:value={decodeInput} id="decode-in-{instanceId}" lang="text" />
          </div>
        </div>


        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="decode-out-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Decoded Text</label>
            <button 
              on:click={() => copy(decodeOutput, 'decode')}
              disabled={!decodeOutput}
              class="flex items-center space-x-2 px-3 py-1.5 transition-all text-xs text-zinc-300 uppercase font-bold tracking-tighter rounded-sm shadow-sm border cursor-pointer {decodeCopyFeedback ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed'}"
            >
              {#if decodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden bg-[#282c34] flex-1 min-h-0 shadow-inner">
            <CodeEditor value={decodeOutput} id="decode-out-{instanceId}" lang="text" readonly={true} />
          </div>
          {#if decodeErrorMsg}
            <div class="mt-2 text-zinc-400 text-xs font-mono shrink-0 p-2 bg-zinc-800 border border-zinc-700 rounded-sm">{decodeErrorMsg}</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>