<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../../components/ui/Button.svelte';

  const dispatch = createEventDispatcher();
  export let initialData: any = {};
  
  let input: string = initialData.input || '';
  let detectUtf8: boolean = initialData.detectUtf8 || false;
  
  interface SpecialChar {
    char: string;
    code: number;
    hex: string;
    name: string;
    index: number;
    line: number;
    col: number;
  }
  
  let detectedChars: SpecialChar[] = [];
  let highlightedHTML: string = '';
  let highlightContainer: HTMLDivElement;

  function getSpecialCharInfo(code: number): string | null {
    if (code === 0x00A0) return "Non-breaking Space";
    if (code === 0x200B) return "Zero Width Space";
    if (code === 0x200C) return "Zero Width Non-Joiner";
    if (code === 0x200D) return "Zero Width Joiner";
    if (code === 0xFEFF) return "Byte Order Mark (BOM)";
    if (code === 0x2028) return "Line Separator";
    if (code === 0x2029) return "Paragraph Separator";
    if (code >= 0x200E && code <= 0x200F) return "Directional Mark";
    if (code >= 0x202A && code <= 0x202E) return "Directional Formatting";
    if (code >= 0x2066 && code <= 0x2069) return "Directional Formatting";
    if (code >= 0x0000 && code <= 0x001F && code !== 9 && code !== 10 && code !== 13) return "Control Character";
    if (code === 0x007F) return "Delete Control Character";
    if (code === 0x3000) return "Ideographic Space";
    if (code >= 0x2000 && code <= 0x200A) return "Special Whitespace";
    if (code === 0x202F || code === 0x205F) return "Special Whitespace";
    if (detectUtf8 && code > 127) return "Non-ASCII (UTF-8)";
    return null;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function analyze() {
    detectedChars = [];
    if (!input) {
      highlightedHTML = '';
      notifyUpdate();
      return;
    }
    
    let line = 1;
    let col = 1;
    let html = '';
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const code = char.charCodeAt(0);
      
      const name = getSpecialCharInfo(code);
      if (name) {
        const displayChar = code < 32 || code === 127 || code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF ? '▯' : char;
        detectedChars.push({ 
          char: displayChar, 
          code, 
          hex: 'U+' + code.toString(16).toUpperCase().padStart(4, '0'),
          name, 
          index: i, 
          line, 
          col 
        });
        
        // Ensure whitespace/invisible chars are somewhat visible in HTML highlight
        const safeDisplay = code === 32 ? '&nbsp;' : escapeHtml(displayChar);
        html += `<span class="bg-red-500/40 text-white rounded-[2px] border-b-2 border-red-500 font-bold inline-block min-w-[8px] text-center">${safeDisplay}</span>`;
      } else {
        html += escapeHtml(char);
      }
      
      if (char === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    
    // Fix trailing newline rendering in div
    if (input.endsWith('\n')) {
      html += '<br/>';
    }
    
    highlightedHTML = html;
    notifyUpdate();
  }

  $: if (input !== undefined || detectUtf8 !== undefined) {
    analyze();
  }

  function notifyUpdate() {
    dispatch('update', { input, detectUtf8 });
  }

  function clearAll() {
    input = '';
    notifyUpdate();
  }

  function handleScroll(e: Event) {
    if (highlightContainer) {
      const target = e.target as HTMLTextAreaElement;
      highlightContainer.scrollTop = target.scrollTop;
      highlightContainer.scrollLeft = target.scrollLeft;
    }
  }
  
  function getSurroundingText(index: number): string {
    const start = Math.max(0, index - 10);
    const end = Math.min(input.length, index + 10);
    let ctx = input.substring(start, end);
    return ctx.replace(/\n/g, '↵');
  }

  const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-3 shrink-0 flex-wrap gap-2">
    <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80 flex items-center space-x-4">
      <span>Special Character Detector</span>
      {#if detectedChars.length > 0}
        <span class="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-sm">{detectedChars.length} Found</span>
      {:else if input.length > 0}
        <span class="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-sm">All Clean</span>
      {/if}
    </div>
    
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <input id="detect-utf8-{instanceId}" type="checkbox" bind:checked={detectUtf8} class="h-3.5 w-3.5 text-zinc-500 border-zinc-700 rounded focus:ring-zinc-500 bg-zinc-900 cursor-pointer">
        <label for="detect-utf8-{instanceId}" class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80 cursor-pointer">Detect Non-ASCII (UTF-8)</label>
      </div>
      <Button variant="secondary" on:click={clearAll} title="Clear All">
        <span>Clear</span>
      </Button>
    </div>
  </div>

  <div class="flex-1 flex gap-4 min-h-0 flex-col sm:flex-row">
    <div class="flex-1 border border-zinc-700 rounded-sm bg-[#282c34] flex flex-col relative overflow-hidden">
      <div class="absolute top-2 left-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pointer-events-none bg-[#282c34]/80 px-2 py-1 rounded z-10">Text Input</div>
      
      <div class="relative w-full h-full flex-1 overflow-hidden isolate">
        <!-- Highlight Backdrop -->
        <div 
          bind:this={highlightContainer}
          class="absolute inset-0 w-full h-full p-4 pt-10 font-mono text-sm whitespace-pre-wrap break-words text-transparent overflow-hidden pointer-events-none custom-scrollbar pb-10"
        >
          {@html highlightedHTML}
        </div>
        
        <!-- Actual Textarea -->
        <textarea 
          class="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-zinc-300 p-4 pt-10 font-mono text-sm resize-none custom-scrollbar pb-10 m-0 z-10" 
          bind:value={input}
          on:scroll={handleScroll}
          placeholder="Paste text here to detect special/invisible characters..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>
    
    <div class="sm:w-1/3 sm:min-w-[300px] flex-1 sm:flex-none border border-zinc-700 rounded-sm bg-zinc-900 flex flex-col overflow-hidden">
      <div class="bg-zinc-900 border-b border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center">
        <span>Detected Characters</span>
      </div>
      <div class="flex-1 overflow-auto custom-scrollbar p-2">
        {#if detectedChars.length > 0}
          <div class="space-y-2">
            {#each detectedChars as item}
              <div class="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm flex flex-col gap-1 hover:border-zinc-500 transition-colors">
                <div class="flex justify-between items-center border-b border-zinc-700/50 pb-1">
                  <span class="text-red-400 font-bold text-lg leading-none bg-zinc-900 px-1.5 py-0.5 rounded shadow-inner min-w-[24px] text-center">{item.char}</span>
                  <span class="text-xs text-zinc-500 font-mono bg-zinc-900 px-1.5 py-0.5 rounded shadow-inner">{item.hex}</span>
                </div>
                <div class="text-xs text-zinc-300 font-bold uppercase tracking-wider mt-1">{item.name}</div>
                <div class="text-xs text-zinc-400 font-mono flex justify-between mt-1">
                  <span>Ln {item.line}, Col {item.col}</span>
                </div>
                <div class="text-xs text-zinc-500 font-mono truncate bg-zinc-950 p-1.5 rounded mt-1 border border-zinc-800/50">
                  ...{getSurroundingText(item.index)}...
                </div>
              </div>
            {/each}
          </div>
        {:else if input.length > 0}
          <div class="h-full flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest text-center px-4">
            No special characters detected.
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
  
  /* Fix textarea text color rendering over highlighted background */
  textarea {
    color: #d4d4d8; /* text-zinc-300 */
    caret-color: white;
  }
  
  textarea::selection {
    background-color: rgba(59, 130, 246, 0.5); /* Blue selection */
  }
</style>
