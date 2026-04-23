<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import { convert } from './converter';
  import Select from '../../components/ui/Select.svelte';
  import Button from '../../components/ui/Button.svelte';

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
      <Select 
        options={formats} 
        bind:value={formatType} 
        id="format-{instanceId}"
      />
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
            <Button variant="secondary" on:click={() => clear('encode')}>
              <span>Clear</span>
            </Button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34] shadow-inner">
            <CodeEditor bind:value={encodeInput} id="encode-in-{instanceId}" lang="text" />
          </div>
        </div>

        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="encode-out-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Result</label>
            <Button 
              variant="secondary"
              on:click={() => copy(encodeOutput, 'encode')}
              disabled={!encodeOutput}
              class={encodeCopyFeedback ? '!bg-zinc-700 !border-zinc-500 !text-white' : ''}
            >
              {#if encodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </Button>
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

    <!-- DECODE Section -->
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
            <Button variant="secondary" on:click={() => clear('decode')}>
              <span>Clear</span>
            </Button>
          </div>
          <div class="border border-zinc-700 rounded-sm overflow-hidden flex-1 min-h-0 bg-[#282c34] shadow-inner">
            <CodeEditor bind:value={decodeInput} id="decode-in-{instanceId}" lang="text" />
          </div>
        </div>

        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-2 h-8 shrink-0">
            <label for="decode-out-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-tighter opacity-80">Decoded Text</label>
            <Button 
              variant="secondary"
              on:click={() => copy(decodeOutput, 'decode')}
              disabled={!decodeOutput}
              class={decodeCopyFeedback ? '!bg-zinc-700 !border-zinc-500 !text-white' : ''}
            >
              {#if decodeCopyFeedback}
                <span>Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </Button>
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
