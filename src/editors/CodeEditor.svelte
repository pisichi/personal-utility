<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState, Compartment } from '@codemirror/state';
  import { javascript } from '@codemirror/lang-javascript';
  import { xml } from '@codemirror/lang-xml';
  import { json } from '@codemirror/lang-json'; // Import the json extension
  import { oneDark } from '@codemirror/theme-one-dark';

  export let value: string = '';
  export let lang: 'javascript' | 'xml' | 'json' | 'text' = 'text';
  export let readonly: boolean = false;
  export let id: string | undefined = undefined;

  let editorEl: HTMLElement;
  let view: EditorView;
  const languageCompartment = new Compartment();

  function getLanguageExtension(language: string) {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'xml':
        return xml();
      case 'json': // Added json case
        return json();
      default:
        return [];
    }
  }

  $: if (view && lang) {
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(lang))
    });
  }

  onMount(() => {
    const initialExtensions = [
      basicSetup,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          value = update.state.doc.toString();
        }
      }),
      languageCompartment.of(getLanguageExtension(lang)), // Set initial language
      oneDark,
      EditorView.lineWrapping // wrap long lines to avoid horizontal scroll
    ];

    if (readonly) {
      initialExtensions.push(EditorState.readOnly.of(true));
    }

    const state = EditorState.create({
      doc: value,
      extensions: initialExtensions,
    });

    view = new EditorView({
      state,
      parent: editorEl,
    });
  });

  afterUpdate(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  });
</script>

<div bind:this={editorEl} {id} class="border border-retro-border rounded-md w-full overflow-auto" style="height: var(--editor-height);"></div>

<style>
  /* Removed fixed height to allow parent components to control size */
</style>
