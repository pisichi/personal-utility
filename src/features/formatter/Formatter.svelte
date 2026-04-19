<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import xmlFormatter from 'xml-formatter';
  import { detectFormatType } from '../../utils/formatDetector';
  import { validateXml, formatXmlWithOrgMsg } from '../../utils/xmlUtils';
  import { ChevronDown } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let initialData: any = {};

  let input: string = initialData.input || '';
  let formatType: 'json' | 'xml' | 'auto' = initialData.formatType || 'auto';
  let decodeOrgMsg: boolean = initialData.decodeOrgMsg || false;

  let output: string = '';
  let errorMessage: string = '';
  let syntaxError: string = '';
  let copyFeedback = false;

  $: effectiveFormat = formatType === 'auto' ? (detectFormatType(input) === 'xml' ? 'xml' : 'json') : formatType;

  // Dropdown logic
  const formats = [
    { value: 'auto', label: 'Auto' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' }
  ];

  $: currentFormatLabel = formatType === 'auto' 
    ? `Auto (${effectiveFormat.toUpperCase()})` 
    : formats.find(f => f.value === formatType)?.label || 'Auto';

  let isFormatDropdownOpen = false;
  let formatDropdownRef: HTMLDivElement;

  function toggleFormatDropdown() {
    isFormatDropdownOpen = !isFormatDropdownOpen;
  }

  function handleFormatChange(newFormat: 'json' | 'xml' | 'auto') {
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

  // Real-time syntax check
  $: {
    if (input.trim()) {
      if (effectiveFormat === 'json') {
        try {
          JSON.parse(input);
          syntaxError = '';
        } catch (e: any) {
          syntaxError = 'Invalid JSON: ' + e.message;
        }
      } else if (effectiveFormat === 'xml') {
        const error = validateXml(input);
        syntaxError = error ? 'Invalid XML: ' + error : '';
      }
    } else {
      syntaxError = '';
    }
  }


  $: {
    dispatch('update', {
      input,
      formatType,
      decodeOrgMsg
    });
  }

  $: if (!input) {
    output = '';
    errorMessage = '';
  }

  function format() {
    try {
      if (!input) return;
      if (effectiveFormat === 'json') {
        output = JSON.stringify(JSON.parse(input), null, 2);
      } else if (effectiveFormat === 'xml') {
        const validationError = validateXml(input);
        if (validationError) {
          throw new Error(validationError);
        }
        if (decodeOrgMsg) {
            output = formatXmlWithOrgMsg(input);
        } else {
            output = xmlFormatter(input, {
              indentation: '  ',
              collapseContent: true,
              lineSeparator: '\n'
            });
        }
      }
      errorMessage = '';
    } catch (e: any) {
      errorMessage = e.message;
      output = '';
    }
  }

  function minify() {
    try {
      if (!input) return;
      if (effectiveFormat === 'json') {
        output = JSON.stringify(JSON.parse(input));
      } else if (effectiveFormat === 'xml') {
        const validationError = validateXml(input);
        if (validationError) {
          throw new Error(validationError);
        }
        output = xmlFormatter(input, {
          indentation: '',
          collapseContent: true,
          lineSeparator: ''
        });
      }
      errorMessage = '';
    } catch (e: any) {
      errorMessage = e.message;
      output = '';
    }
  }

  function copyOutput() {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        copyFeedback = true;
        setTimeout(() => (copyFeedback = false), 2000);
      });
    }
  }

  function clearAll() {
    input = '';
    output = '';
    errorMessage = '';
    syntaxError = '';
  }

  const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="space-y-8 flex flex-col h-full min-h-0 pr-1">
  <div class="flex flex-wrap items-end gap-6 shrink-0 relative z-40">
    <div class="flex-1 min-w-[160px] max-w-sm">
      <label for="format-type-{instanceId}" class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 opacity-80">Format Type</label>
      
      <div class="relative w-full" bind:this={formatDropdownRef}>
        <button 
          id="format-type-{instanceId}"
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
                  on:click|stopPropagation={() => handleFormatChange(fmt.value as any)}
                  class="flex items-center px-3 py-2 text-sm font-medium cursor-pointer border-none text-left transition-colors w-full
                         {formatType === fmt.value ? 'bg-zinc-700 text-zinc-100' : 'bg-transparent text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100'}"
                >
                  {fmt.label === 'Auto' ? `Auto (${effectiveFormat.toUpperCase()})` : fmt.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    {#if effectiveFormat === 'xml'}
    <div class="flex items-center mb-3">
      <input id="decode-org-msg-{instanceId}" type="checkbox" bind:checked={decodeOrgMsg} class="h-4 w-4 text-zinc-500 border-zinc-700 rounded focus:ring-zinc-500 bg-zinc-900 cursor-pointer">
      <label for="decode-org-msg-{instanceId}" class="ml-2 block text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80 cursor-pointer">Decode OrgMsg</label>
    </div>
    {/if}

    <div class="flex space-x-3 mb-1">
      <button on:click={format} class="flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-sm shadow-sm border border-zinc-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!syntaxError && !!input}>
        <span>Format</span>
      </button>
      <button on:click={minify} class="flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-sm shadow-sm border border-zinc-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!syntaxError && !!input}>
        <span>Minify</span>
      </button>
      <button on:click={clearAll} class="flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-sm cursor-pointer transition-colors rounded-sm">
        <span>Clear</span>
      </button>
    </div>
  </div>

  {#if syntaxError && input}
  <div class="p-3 border border-yellow-900/50 bg-yellow-900/10 text-yellow-500 text-xs font-mono rounded-sm shrink-0">
    {syntaxError}
  </div>
  {/if}

  {#if errorMessage}
  <div class="p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs font-mono rounded-sm shrink-0">
    Execution Error: {errorMessage}
  </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 z-10 relative">
    <div class="flex flex-col h-full min-h-0">
      <div class="flex items-center justify-between mb-3 shrink-0 h-8 border-b border-zinc-800 pb-2">
        <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest">Source Input</h2>
      </div>
      <div class="border border-zinc-700 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34] shadow-inner">
        <CodeEditor bind:value={input} id="format-in-{instanceId}" lang={effectiveFormat === 'xml' ? 'xml' : 'json'} />
      </div>
    </div>
    <div class="flex flex-col h-full min-h-0">
      <div class="flex items-center justify-between mb-3 shrink-0 h-8 border-b border-zinc-800 pb-2">
        <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest">Formatted Result</h2>
        <button 
          on:click={copyOutput} 
          disabled={!output}
          class="flex items-center space-x-2 px-3 py-1.5 transition-all text-xs text-zinc-300 uppercase font-bold tracking-tighter rounded-sm shadow-sm border cursor-pointer {copyFeedback ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed'}"
        >
          {#if copyFeedback}
            <span>Copied</span>
          {:else}
            <span>Copy</span>
          {/if}
        </button>
      </div>
      <div class="border border-zinc-700 rounded-sm overflow-hidden bg-[#282c34] flex-1 min-h-0 shadow-inner">
        <CodeEditor value={output} id="format-out-{instanceId}" lang={effectiveFormat === 'xml' ? 'xml' : 'json'} readonly={true} />
      </div>
    </div>
  </div>
</div>