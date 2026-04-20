<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, scrollPastEnd } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
  import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { javascript } from '@codemirror/lang-javascript';
  import { xml } from '@codemirror/lang-xml';
  import { json } from '@codemirror/lang-json';
  import { oneDark } from '@codemirror/theme-one-dark';

  export let value: string = '';
  export let lang: 'javascript' | 'xml' | 'json' | 'text' = 'text';
  export let readonly: boolean = false;
  export let id: string | undefined = undefined;

  let editorEl: HTMLElement;
  let view: EditorView | undefined;
  const languageCompartment = new Compartment();

  function getLanguageExtension(language: string) {
    switch (language) {
      case 'javascript': return javascript();
      case 'xml': return xml();
      case 'json': return json();
      default: return [];
    }
  }

  $: if (view && lang) {
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(lang))
    });
  }


  $: if (view && value !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value }
    });
  }

  onMount(() => {
    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab
      ]),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          if (newValue !== value) {
            value = newValue;
          }
        }
      }),
      languageCompartment.of(getLanguageExtension(lang)),
      oneDark,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { height: "100%", outline: "none" },
        ".cm-scroller": { overflow: "auto" },
        "&.cm-focused": { outline: "none" }
      })
    ];

    if (readonly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions
      }),
      parent: editorEl,
    });
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
      view = undefined;
    }
  });
</script>

<div 
  bind:this={editorEl} 
  {id} 
  class="w-full h-full min-h-0 bg-[#282c34] flex flex-col overflow-hidden"
></div>

<style>
  :global(.cm-editor) {
    height: 100% !important;
    width: 100% !important;
    flex: 1;
    min-height: 0;
  }
</style>
