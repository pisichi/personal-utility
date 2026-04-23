<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { xml } from '@codemirror/lang-xml';
  import { json } from '@codemirror/lang-json';
  import { MergeView, unifiedMergeView } from '@codemirror/merge';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { detectFormatType } from '../../utils/formatDetector';
  import Button from '../../components/ui/Button.svelte';

  const dispatch = createEventDispatcher();

  export let initialData: any = {};

  let text1: string = initialData.original || '';
  let text2: string = initialData.modified || '';
  
  let editorEl: HTMLElement;
  let mergeView: MergeView | undefined;
  let unifiedView: EditorView | undefined;
  
  let viewMode: 'split' | 'unified' = 'split';

  function getLanguageExtension(text: string) {
    const format = detectFormatType(text);
    if (format === 'json') return json();
    if (format === 'xml') return xml();
    return [];
  }

  function initView() {
    if (mergeView) {
      mergeView.destroy();
      mergeView = undefined;
    }
    if (unifiedView) {
      unifiedView.destroy();
      unifiedView = undefined;
    }
    
    if (editorEl) {
      editorEl.innerHTML = '';
    }

    if (viewMode === 'split') {
      mergeView = new MergeView({
        a: {
          doc: text1,
          extensions: [
            basicSetup,
            oneDark,
            getLanguageExtension(text1),
            EditorView.lineWrapping,
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                text1 = update.state.doc.toString();
                notifyUpdate();
              }
            })
          ],
        },
        b: {
          doc: text2,
          extensions: [
            basicSetup,
            oneDark,
            getLanguageExtension(text2),
            EditorView.lineWrapping,
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                text2 = update.state.doc.toString();
                notifyUpdate();
              }
            })
          ],
        },
        parent: editorEl,
      });
    } else {
      // Unified view is typically read-only for text1, 
      // but we can let them edit text2 and it will show diffs.
      // To prevent confusion, maybe we should make unified view entirely read-only?
      // Or just allow standard unified merge view behavior.
      unifiedView = new EditorView({
        doc: text2,
        extensions: [
          basicSetup,
          oneDark,
          getLanguageExtension(text2),
          EditorView.lineWrapping,
          unifiedMergeView({
            original: text1,
          }),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              text2 = update.state.doc.toString();
              notifyUpdate();
            }
          }),
          EditorView.theme({
            "&": { height: "100%" },
            ".cm-scroller": { overflow: "auto" }
          })
        ],
        parent: editorEl,
      });
    }
  }

  function notifyUpdate() {
    dispatch('update', {
      original: text1,
      modified: text2
    });
  }

  function toggleViewMode() {
    viewMode = viewMode === 'split' ? 'unified' : 'split';
    setTimeout(initView, 0);
  }

  onMount(() => {
    setTimeout(initView, 0);
  });

  onDestroy(() => {
    if (mergeView) mergeView.destroy();
    if (unifiedView) unifiedView.destroy();
  });

  function clearAll() {
    text1 = '';
    text2 = '';
    initView();
    notifyUpdate();
  }

  function swap() {
    const temp = text1;
    text1 = text2;
    text2 = temp;
    initView();
    notifyUpdate();
  }

  const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="space-y-4 h-full flex flex-col min-h-0">
  <div class="flex justify-between items-center border-b border-zinc-800 pb-3 shrink-0">
    <div class="flex space-x-4">
      <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80">
        Text 1
      </div>
      <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-80">
        Text 2
      </div>
    </div>
    <div class="flex space-x-3">
      <Button variant="secondary" on:click={toggleViewMode} title="Toggle View Mode">
        <span>{viewMode === 'split' ? 'Inline Diff' : 'Side-by-side Diff'}</span>
      </Button>
      <Button variant="secondary" on:click={swap} title="Swap Sides">
        <span>Swap</span>
      </Button>
      <Button variant="secondary" on:click={clearAll} title="Clear All">
        <span>Clear</span>
      </Button>
    </div>
  </div>

  {#if viewMode === 'split'}
    <div class="grid grid-cols-2 gap-4 mb-2 shrink-0">
      <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest opacity-80 text-center border-b border-zinc-800 pb-2">Text 1 ({detectFormatType(text1).toUpperCase()})</h2>
      <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest opacity-80 text-center border-b border-zinc-800 pb-2">Text 2 ({detectFormatType(text2).toUpperCase()})</h2>
    </div>
  {:else}
    <div class="mb-2 shrink-0">
      <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest opacity-80 text-center border-b border-zinc-800 pb-2">Inline Diff (Read-only for Text 1)</h2>
    </div>
  {/if}
  
  <div bind:this={editorEl} class="border border-zinc-700 rounded-sm w-full bg-[#282c34] flex-1 overflow-hidden min-h-0 shadow-inner merge-view-container"></div>
</div>

<style>
  /* Base styles for the container */
  .merge-view-container {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  
  /* Make the outer MergeView the scrolling container */
  :global(.cm-mergeView) {
    height: 100%;
    overflow-y: auto !important;
    overflow-x: hidden;
  }

  /* Ensure the editors grow inside the scrolling container */
  :global(.cm-mergeViewEditors) {
    min-height: 100%;
  }
  
  /* Shared editor styles */
  :global(.cm-editor) {
    outline: none !important;
  }

  /* VS Code-like Diff Highlighting for Dark Theme */
  :global(.cm-merge-a .cm-changedLine),
  :global(.cm-merge-a .cm-deletedChunk),
  :global(.cm-deletedLine) {
    background-color: rgba(244, 135, 113, 0.2) !important;
  }
  
  :global(.cm-merge-b .cm-changedLine),
  :global(.cm-merge-b .cm-insertedChunk),
  :global(.cm-insertedLine) {
    background-color: rgba(156, 207, 134, 0.2) !important;
  }

  :global(.cm-merge-a .cm-changedText),
  :global(.cm-merge-a .cm-deletedText),
  :global(.cm-deletedText) {
    background-color: rgba(244, 135, 113, 0.4) !important;
  }
  
  :global(.cm-merge-b .cm-changedText),
  :global(.cm-merge-b .cm-insertedText),
  :global(.cm-insertedText) {
    background-color: rgba(156, 207, 134, 0.4) !important;
  }
  
  :global(.cm-merge-a .cm-changedLineGutter),
  :global(.cm-merge-a .cm-deletedLineGutter) {
    background-color: rgba(244, 135, 113, 0.15) !important;
  }
  
  :global(.cm-merge-b .cm-changedLineGutter),
  :global(.cm-merge-b .cm-insertedLineGutter) {
    background-color: rgba(156, 207, 134, 0.15) !important;
  }
</style>
