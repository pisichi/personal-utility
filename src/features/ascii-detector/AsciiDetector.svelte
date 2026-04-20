<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let initialData: any = {};
  
  let input: string = initialData.input || '';
  
  interface NonAsciiChar {
    char: string;
    code: number;
    index: number;
    line: number;
    col: number;
  }
  
  let detectedChars: NonAsciiChar[] = [];

  function analyze() {
    detectedChars = [];
    if (!input) {
      notifyUpdate();
      return;
    }
    
    let line = 1;
    let col = 1;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const code = char.charCodeAt(0);
      
      if (code > 127) {
        detectedChars.push({ char, code, index: i, line, col });
      }
      
      if (char === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    notifyUpdate();
  }

  $: if (input !== undefined) {
    analyze();
  }

  function notifyUpdate() {
    dispatch('update', { input });
  }

  function clearAll() {
    input = '';
    notifyUpdate();
  }
  
  function getSurroundingText(index: number): string {
    const start = Math.max(0, index - 10);
    const end = Math.min(input.length, index + 10);
    let ctx = input.substring(start, end);
    return ctx.replace(/\n/g, '↵');
  }
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-3 shrink-0">
    <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80 flex items-center space-x-4">
      <span>Non-ASCII Detector</span>
      {#if detectedChars.length > 0}
        <span class="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-sm">{detectedChars.length} Found</span>
      {:else if input.length > 0}
        <span class="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-sm">All Clean</span>
      {/if}
    </div>
    <div class="flex space-x-3">
      <button on:click={clearAll} title="Clear All" aria-label="Clear all content" class="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-sm shadow-sm border border-zinc-700 cursor-pointer">
        <span>Clear</span>
      </button>
    </div>
  </div>

  <div class="flex-1 flex gap-4 min-h-0 flex-col sm:flex-row">
    <div class="flex-1 border border-zinc-700 rounded-sm bg-[#282c34] flex flex-col relative overflow-hidden">
      <div class="absolute top-2 left-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pointer-events-none bg-[#282c34]/80 px-2 py-1 rounded">Text Input</div>
      <textarea 
        class="flex-1 w-full bg-transparent border-none outline-none text-zinc-300 p-4 pt-10 font-mono text-sm resize-none custom-scrollbar" 
        bind:value={input}
        placeholder="Paste text here to detect non-ASCII characters..."
        spellcheck="false"
      ></textarea>
    </div>
    
    <div class="sm:w-1/3 sm:min-w-[300px] flex-1 sm:flex-none border border-zinc-700 rounded-sm bg-zinc-900 flex flex-col overflow-hidden">
      <div class="bg-zinc-900 border-b border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
        Detected Characters
      </div>
      <div class="flex-1 overflow-auto custom-scrollbar p-2">
        {#if detectedChars.length > 0}
          <div class="space-y-2">
            {#each detectedChars as item}
              <div class="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm flex flex-col gap-1">
                <div class="flex justify-between items-center border-b border-zinc-700/50 pb-1">
                  <span class="text-red-400 font-bold text-lg leading-none">{item.char}</span>
                  <span class="text-xs text-zinc-500 font-mono">Code: {item.code}</span>
                </div>
                <div class="text-xs text-zinc-400 font-mono flex justify-between mt-1">
                  <span>Ln {item.line}, Col {item.col}</span>
                </div>
                <div class="text-xs text-zinc-500 font-mono truncate bg-zinc-900 p-1 rounded mt-1">
                  ...{getSurroundingText(item.index)}...
                </div>
              </div>
            {/each}
          </div>
        {:else if input.length > 0}
          <div class="h-full flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest text-center px-4">
            No non-ASCII characters detected.
          </div>
        {:else}
          <div class="h-full flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest text-center px-4">
            Enter text to begin detection.
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3f3f46;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #52525b;
  }
</style>