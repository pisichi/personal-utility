<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { javascript } from '@codemirror/lang-javascript';
  import { xml } from '@codemirror/lang-xml'; // Import xml extension
  import { json } from '@codemirror/lang-json'; // Import json extension
  import { MergeView } from '@codemirror/merge';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { detectFormatType } from '../../utils/formatDetector';

  let original: string = typeof window !== 'undefined' ? localStorage.getItem('comparatorOriginal') || '{\n  "hello": "world"\n}' : '{\n  "hello": "world"\n}';
  let modified: string = typeof window !== 'undefined' ? localStorage.getItem('comparatorModified') || '{\n  "hello": "svelte"\n}' : '{\n  "hello": "svelte"\n}';
  let originalLang: 'json' | 'xml' | 'text' = detectFormatType(original);
  let modifiedLang: 'json' | 'xml' | 'text' = detectFormatType(modified);
  let editorEl: HTMLElement;

  function getLanguageExtension(format: 'json' | 'xml' | 'text') {
    if (format === 'json') {
      return json(); // Use json() extension for JSON
    } else if (format === 'xml') {
      return xml();
    }
    return []; // No specific language extension for 'text'
  }

  onMount(() => {
    const originalVal = localStorage.getItem('comparatorOriginal') || '{\n  "hello": "world"\n}';
    const modifiedVal = localStorage.getItem('comparatorModified') || '{\n  "hello": "svelte"\n}';
    
    original = originalVal;
    modified = modifiedVal;
    originalLang = detectFormatType(original);
    modifiedLang = detectFormatType(modified);

    new MergeView({
      a: {
        doc: original,
        extensions: [
          oneDark,
          getLanguageExtension(originalLang),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              original = update.state.doc.toString();
              localStorage.setItem('comparatorOriginal', original);
            }
          })
        ],
      },
      b: {
        doc: modified,
        extensions: [
          oneDark,
          getLanguageExtension(modifiedLang),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              modified = update.state.doc.toString();
              localStorage.setItem('comparatorModified', modified);
            }
          })
        ],
      },
      parent: editorEl,
    });
  });

  // Save state to localStorage whenever it changes
  $: {
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparatorOriginal', original);
      localStorage.setItem('comparatorModified', modified);
    }
  }
</script>

<div>
  <div class="grid grid-cols-2 gap-4 mb-2">
    <h2 class="text-center text-retro-text">Original</h2>
    <h2 class="text-center text-retro-text">Modified</h2>
  </div>
  <div bind:this={editorEl} class="border border-retro-border rounded-md w-full overflow-auto" style="height: var(--editor-height);"></div>
</div>

<style>
  /* Removed hard-coded height, now using standard --editor-height from global.css */
</style>
