<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import xmlFormatter from 'xml-formatter';
  import { detectFormatType } from '../../utils/formatDetector';
  import { validateXml, formatXmlWithOrgMsg } from '../../utils/xmlUtils';

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

  // Notify parent of state changes
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

<div class="space-y-6 flex flex-col h-full min-h-0 pr-1">
  <div class="flex flex-wrap items-end gap-4 shrink-0">
    <div class="flex-1 min-w-[140px]">
      <label for="format-type-{instanceId}" class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 opacity-70">Format Type</label>
      <select id="format-type-{instanceId}" bind:value={formatType} class="block w-full border border-zinc-700 rounded-sm bg-zinc-900 text-white text-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500">
        <option value="auto">Auto ({effectiveFormat.toUpperCase()})</option>
        <option value="json">JSON</option>
        <option value="xml">XML</option>
      </select>
    </div>

    {#if effectiveFormat === 'xml'}
    <div class="flex items-center mb-2.5">
      <input id="decode-org-msg-{instanceId}" type="checkbox" bind:checked={decodeOrgMsg} class="h-4 w-4 text-blue-500 border-zinc-700 rounded focus:ring-blue-500 bg-zinc-900">
      <label for="decode-org-msg-{instanceId}" class="ml-2 block text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-80 cursor-pointer">Decode OrgMsg</label>
    </div>
    {/if}

    <div class="flex space-x-2 mb-1">
      <button on:click={format} class="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-sm shadow-sm disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!syntaxError && !!input}>
        <span>Format</span>
      </button>
      <button on:click={minify} class="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-amber-600 hover:bg-amber-500 transition-colors rounded-sm border border-amber-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!syntaxError && !!input}>
        <span>Minify</span>
      </button>
      <button on:click={clearAll} class="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-sm">
        <span>Clear</span>
      </button>
    </div>
  </div>

  {#if syntaxError && input}
  <div class="p-3 border border-yellow-900/50 bg-yellow-900/10 text-yellow-500 text-[10px] font-mono rounded-sm shrink-0">
    {syntaxError}
  </div>
  {/if}

  {#if errorMessage}
  <div class="p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-[10px] font-mono rounded-sm shrink-0">
    Execution Error: {errorMessage}
  </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
    <div class="flex flex-col h-full min-h-0">
      <div class="flex items-center justify-between mb-3 shrink-0 h-6 border-b border-emerald-900/30">
        <h2 class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">Source Input</h2>
      </div>
      <div class="border border-zinc-800 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34]">
        <CodeEditor bind:value={input} id="format-in-{instanceId}" lang={effectiveFormat === 'xml' ? 'xml' : 'json'} />
      </div>
    </div>
    <div class="flex flex-col h-full min-h-0">
      <div class="flex items-center justify-between mb-3 shrink-0 h-6 border-b border-amber-900/30">
        <h2 class="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-80">Formatted Result</h2>
        <button 
          on:click={copyOutput} 
          disabled={!output}
          class="flex items-center space-x-1 px-2 py-0.5 transition-all text-[9px] text-white uppercase font-bold tracking-tighter rounded shadow-sm {copyFeedback ? 'bg-emerald-600' : 'bg-amber-600 hover:bg-amber-500'}"
        >
          {#if copyFeedback}
            <span>Copied</span>
          {:else}
            <span>Copy</span>
          {/if}
        </button>
      </div>
      <div class="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900 flex-1 min-h-0">
        <CodeEditor value={output} id="format-out-{instanceId}" lang={effectiveFormat === 'xml' ? 'xml' : 'json'} readonly={true} />
      </div>
    </div>
  </div>
</div>
