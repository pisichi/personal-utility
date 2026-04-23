<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../../components/ui/Button.svelte';
  const dispatch = createEventDispatcher();
  
  export let initialData: any = {};
  
  let base64String: string = initialData.base64 || '';
  let imageSrc: string = base64String || '';
  
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    base64String = target.value;
    updateImageFromBase64();
  }
  
  function updateImageFromBase64() {
    if (base64String.startsWith('data:image')) {
      imageSrc = base64String;
    } else if (base64String.length > 0) {
      imageSrc = `data:image/png;base64,${base64String}`;
    } else {
      imageSrc = '';
    }
    notifyUpdate();
  }
  
  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      base64String = result;
      imageSrc = result;
      notifyUpdate();
    };
    reader.readAsDataURL(file);
  }

  function notifyUpdate() {
    dispatch('update', { base64: base64String });
  }

  function clearAll() {
    base64String = '';
    imageSrc = '';
    notifyUpdate();
  }
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-3 shrink-0">
    <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80">
      Base64 Image Encoder/Decoder
    </div>
    <div class="flex space-x-3">
      <Button variant="secondary" on:click={clearAll} title="Clear All">
        <span>Clear</span>
      </Button>
    </div>
  </div>

  <div class="flex flex-1 min-h-0 gap-4 flex-col sm:flex-row">
    <!-- Image Dropzone / Preview -->
    <div 
      class="flex-1 border border-zinc-700 rounded-sm bg-[#282c34] flex flex-col overflow-hidden relative"
      on:drop={handleDrop}
      on:dragover={handleDragOver}
      role="region"
      aria-label="Image dropzone"
    >
      <div class="absolute top-2 left-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pointer-events-none z-10 bg-[#282c34]/80 px-2 py-1 rounded">Image Preview</div>
      
      {#if imageSrc}
        <div class="flex-1 flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWUxZTFlIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzI4MmMyZSIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyODJjMmUiLz48L3N2Zz4=')]">
          <img src={imageSrc} alt="Preview" class="max-w-full max-h-full object-contain shadow-lg" />
        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center text-zinc-500 p-4 border-2 border-dashed border-zinc-700 m-4 rounded hover:border-zinc-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          <p class="text-sm font-bold uppercase tracking-widest text-center mb-2">Drag & Drop Image Here</p>
          <p class="text-xs uppercase tracking-widest mb-4">or</p>
          <label class="cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-sm border border-zinc-700 shadow-sm">
            Select File
            <input type="file" accept="image/*" class="hidden" on:change={handleFileChange} />
          </label>
        </div>
      {/if}
    </div>

    <!-- Base64 Input/Output -->
    <div class="flex-1 border border-zinc-700 rounded-sm bg-[#282c34] flex flex-col relative">
      <div class="absolute top-2 left-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pointer-events-none bg-[#282c34]/80 px-2 py-1 rounded">Base64 String</div>
      <textarea 
        class="flex-1 w-full bg-transparent border-none outline-none text-zinc-300 p-4 pt-10 font-mono text-sm resize-none custom-scrollbar" 
        bind:value={base64String}
        on:input={handleInput}
        placeholder="Paste base64 string here..."
        spellcheck="false"
      ></textarea>
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