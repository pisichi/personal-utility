<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { xml } from '@codemirror/lang-xml';
  import { json } from '@codemirror/lang-json';
  import { MergeView } from '@codemirror/merge';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { detectFormatType } from '../../utils/formatDetector';

  const dispatch = createEventDispatcher();

  export let initialData: any = {};

  let original: string = initialData.original || '';
  let modified: string = initialData.modified || '';
  
  let editorEl: HTMLElement;
  let mergeView: MergeView;

  function getLanguageExtension(text: string) {
    const format = detectFormatType(text);
    if (format === 'json') return json();
    if (format === 'xml') return xml();
    return [];
  }

  function initMergeView() {
    if (mergeView) {
      const parent = mergeView.dom.parentElement;
      if (parent) parent.innerHTML = '';
    }

    mergeView = new MergeView({
      a: {
        doc: original,
        extensions: [
          basicSetup,
          oneDark,
          getLanguageExtension(original),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              original = update.state.doc.toString();
              notifyUpdate();
            }
          })
        ],
      },
      b: {
        doc: modified,
        extensions: [
          basicSetup,
          oneDark,
          getLanguageExtension(modified),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              modified = update.state.doc.toString();
              notifyUpdate();
            }
          })
        ],
      },
      parent: editorEl,
    });
  }

  function notifyUpdate() {
    dispatch('update', {
      original,
      modified
    });
  }

  onMount(() => {
    initMergeView();
  });

  onDestroy(() => {
  });

  function clearAll() {
    original = '';
    modified = '';
    initMergeView();
    notifyUpdate();
  }

  function swap() {
    const temp = original;
    original = modified;
    modified = temp;
    initMergeView();
    notifyUpdate();
  }

  const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-2 shrink-0">
    <div class="flex space-x-4">
      <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest opacity-60">
        Left: {detectFormatType(original).toUpperCase()}
      </div>
      <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest opacity-60">
        Right: {detectFormatType(modified).toUpperCase()}
      </div>
    </div>
    <div class="flex space-x-2">
      <button on:click={swap} title="Swap Sides" aria-label="Swap sides" class="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-colors rounded-sm shadow-sm">
        <span>Swap</span>
      </button>
      <button on:click={clearAll} title="Clear All" aria-label="Clear all content" class="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-sm">
        <span>Clear</span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 mb-3 shrink-0">
    <h2 class="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-80 text-center border-b border-amber-900/30 pb-1">Original Source</h2>
    <h2 class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-80 text-center border-b border-emerald-900/30 pb-1">Modified Result</h2>
  </div>
  
  <div bind:this={editorEl} class="border border-zinc-800 rounded-sm w-full bg-zinc-900 flex-1 overflow-hidden min-h-0 shadow-inner"></div>
</div>

<style>
  :global(.cm-mergeView) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  :global(.cm-mergeViewEditors) {
    height: 100% !important;
    overflow: hidden !important;
    display: flex !important;
  }
  :global(.cm-editor) {
    height: 100% !important;
  }
  :global(.cm-scroller) {
    overflow: auto !important;
  }
</style>
