<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import { convert } from './converter';

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

<div class="space-y-6 flex flex-col h-full min-h-0">
  <!-- Format Type Selector -->
  <div class="shrink-0">
    <label for="format-{instanceId}" class="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest opacity-70">Conversion Format</label>
    <select 
      id="format-{instanceId}"
      bind:value={formatType}
      class="w-full border border-zinc-700 rounded-sm bg-zinc-900 text-white text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
    >
      {#each formats as fmt}
        <option value={fmt.value}>{fmt.label}</option>
      {/each}
    </select>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-0">
    <!-- ENCODE Section -->
    <div class="flex flex-col min-h-0 border-r border-zinc-800/30 pr-4 xl:pr-8 last:border-0 last:pr-0">
      <div class="flex items-center justify-between border-b border-blue-900/50 pb-1 shrink-0 mb-4">
        <h3 class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Encode</h3>
        <span class="text-[9px] text-zinc-500 font-mono">TEXT → {formatType.toUpperCase()}</span>
      </div>
      
      <div class="flex-1 grid grid-rows-2 gap-6 min-h-0">
        <!-- Input -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-6 shrink-0">
            <label for="encode-in-{instanceId}" class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-60">Source Text</label>
            <button on:click={() => clear('encode')} class="flex items-center space-x-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors text-[9px] text-white uppercase font-bold tracking-tighter shadow-sm">
              <span>Clear</span>
            </button>
          </div>
          <div class="border border-zinc-800 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34]">
            <CodeEditor bind:value={encodeInput} id="encode-in-{instanceId}" lang="text" />
          </div>
        </div>

        <!-- Output -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-6 shrink-0">
            <label for="encode-out-{instanceId}" class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-60">Result</label>
            <button 
              on:click={() => copy(encodeOutput, 'encode')}
              disabled={!encodeOutput}
              class="flex items-center space-x-1 px-2 py-1 transition-all text-[9px] text-white uppercase font-bold tracking-tighter rounded shadow-sm {encodeCopyFeedback ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'}"
            >
              {#if encodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>
          <div class="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900 flex-1 min-h-0">
            <CodeEditor value={encodeOutput} id="encode-out-{instanceId}" lang="text" readonly={true} />
          </div>
          {#if encodeErrorMsg}
            <div class="mt-2 text-red-500 text-[9px] font-mono shrink-0">{encodeErrorMsg}</div>
          {/if}
        </div>
      </div>
    </div>

    <!-- DECODE Section -->
    <div class="flex flex-col min-h-0">
      <div class="flex items-center justify-between border-b border-emerald-900/50 pb-1 shrink-0 mb-4">
        <h3 class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Decode</h3>
        <span class="text-[9px] text-zinc-500 font-mono">{formatType.toUpperCase()} → TEXT</span>
      </div>
      
      <div class="flex-1 grid grid-rows-2 gap-6 min-h-0">
        <!-- Input -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-6 shrink-0">
            <label for="decode-in-{instanceId}" class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-60">Encoded Content</label>
            <button on:click={() => clear('decode')} class="flex items-center space-x-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors text-[9px] text-white uppercase font-bold tracking-tighter shadow-sm">
              <span>Clear</span>
            </button>
          </div>
          <div class="border border-zinc-800 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34]">
            <CodeEditor bind:value={decodeInput} id="decode-in-{instanceId}" lang="text" />
          </div>
        </div>

        <!-- Output -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-6 shrink-0">
            <label for="decode-out-{instanceId}" class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-60">Decoded Text</label>
            <button 
              on:click={() => copy(decodeOutput, 'decode')}
              disabled={!decodeOutput}
              class="flex items-center space-x-1 px-2 py-1 transition-all text-[9px] text-white uppercase font-bold tracking-tighter rounded shadow-sm {decodeCopyFeedback ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-500'}"
            >
              {#if decodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>
          <div class="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900 flex-1 min-h-0">
            <CodeEditor value={decodeOutput} id="decode-out-{instanceId}" lang="text" readonly={true} />
          </div>
          {#if decodeErrorMsg}
            <div class="mt-2 text-red-500 text-[9px] font-mono shrink-0">{decodeErrorMsg}</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
