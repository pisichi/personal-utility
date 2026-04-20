<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import { detectFormatType } from '../../utils/formatDetector';

  const dispatch = createEventDispatcher();
  
  export let initialData: any = {};
  
  let input: string = initialData.input || '';
  let output: string = initialData.output || '';
  let errorMsg: string = '';

  function minifyText() {
    errorMsg = '';
    if (!input.trim()) {
      output = '';
      notifyUpdate();
      return;
    }

    const format = detectFormatType(input);

    try {
      if (format === 'json') {
        output = JSON.stringify(JSON.parse(input));
      } else {
        output = input.replace(/\s+/g, ' ').trim();
      }
    } catch (e: any) {
      errorMsg = e.message || 'Minification error';
      output = '';
    }

    notifyUpdate();
  }

  $: if (input !== undefined) {
    minifyText();
  }

  function notifyUpdate() {
    dispatch('update', { input, output });
  }

  function clearAll() {
    input = '';
    output = '';
    errorMsg = '';
    notifyUpdate();
  }
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-3 shrink-0">
    <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80">
      Text Minifier
    </div>
    <div class="flex space-x-3 items-center">
      {#if errorMsg}
        <div class="text-red-400 text-xs font-bold uppercase tracking-widest">{errorMsg}</div>
      {/if}
      <button on:click={clearAll} title="Clear All" aria-label="Clear all content" class="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-sm shadow-sm border border-zinc-700 cursor-pointer">
        <span>Clear</span>
      </button>
    </div>
  </div>

  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <div class="flex-1 flex flex-col border border-zinc-700 rounded-sm bg-[#282c34] overflow-hidden min-h-[100px]">
      <div class="bg-zinc-900 border-b border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Input ({detectFormatType(input)})</div>
      <CodeEditor bind:value={input} lang={detectFormatType(input) === 'json' ? 'json' : 'text'} />
    </div>
    
    <div class="flex-1 flex flex-col border border-zinc-700 rounded-sm bg-[#282c34] overflow-hidden min-h-[100px]">
      <div class="bg-zinc-900 border-b border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
        <span>Output</span>
        {#if output && input.length > 0}
           <span>{input.length} &rarr; {output.length} chars ({(100 - (output.length / input.length * 100)).toFixed(1)}% reduction)</span>
        {/if}
      </div>
      <CodeEditor bind:value={output} readonly={true} lang={detectFormatType(output) === 'json' ? 'json' : 'text'} />
    </div>
  </div>
</div>
