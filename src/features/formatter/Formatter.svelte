<script lang="ts">
  import { onMount } from 'svelte';
  import CodeEditor from '../../editors/CodeEditor.svelte';
  import xmlFormatter from 'xml-formatter';
  import { base64ToUtf8 } from '../../utils/decode';

  let input: string = typeof window !== 'undefined' ? localStorage.getItem('formatterInput') || '' : '';
  let output: string = '';
  let errorMessage: string = '';
  let formatType: 'json' | 'xml' = typeof window !== 'undefined' && localStorage.getItem('formatterFormatType') ? (localStorage.getItem('formatterFormatType') as 'json' | 'xml') : 'json';
  let decodeOrgMsg: boolean = false;
  let effectiveFormat: 'json' | 'xml' = formatType;

  onMount(() => {
    effectiveFormat = formatType;
  });

  $: {
    if (typeof window !== 'undefined') {
      localStorage.setItem('formatterInput', input);
      localStorage.setItem('formatterFormatType', formatType);
      effectiveFormat = formatType;
    }
  }

  // Reactive statement to clear output/error when input is empty
  $: if (!input) {
    output = '';
    errorMessage = '';
  }
  
  function validateXml(xmlStr: string): string {
    if (typeof DOMParser === 'undefined') return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'application/xml');
    const errs = doc.getElementsByTagName('parsererror');
    if (errs.length > 0) {
      return errs[0].textContent || 'XML parsing error';
    }
    return '';
  }

  function formatXmlWithOrgMsg(xmlString: string): string {
    const processedXml = xmlString.replace(/<([^>]*OrgMsg[^>]*)>([^<]+)<\/\1>/g, (match, tagName, base64Content) => {
        try {
            const decoded = base64ToUtf8(base64Content);
            const formattedDecoded = formatXmlWithOrgMsg(decoded); // Recursive call
            return `<${tagName}>\n${formattedDecoded}\n</${tagName}>`;
        } catch (e) {
            console.warn("Failed to decode or format base64 content:", e);
            return match;
        }
    });

    return xmlFormatter(processedXml, {
        indentation: '  ',
        collapseContent: true, // Collapse content for tighter formatting
        lineSeparator: '\n'
    });
  }

  function format() {
    try {
      if (effectiveFormat === 'json') {
        output = JSON.stringify(JSON.parse(input), null, 2);
      } else if (effectiveFormat === 'xml') {
        const validationError = validateXml(input);
        if (validationError) {
          throw new Error(validationError);
        }
        if (decodeOrgMsg) {
            output = formatXmlWithOrgMsg(input);
        } else {
            output = xmlFormatter(input, {
              indentation: '  ',
              collapseContent: true, // Collapse whitespace in text content
              lineSeparator: '\n'
            });
        }
      }
      errorMessage = '';
    } catch (e: any) {
      errorMessage = e.message;
      output = '';
    }
  }

  function minify() {
    try {
      if (effectiveFormat === 'json') {
        output = JSON.stringify(JSON.parse(input));
      } else if (effectiveFormat === 'xml') {
        const validationError = validateXml(input);
        if (validationError) {
          throw new Error(validationError);
        }
        // Note: minify doesn't use the decode logic. This could be a future improvement.
        output = xmlFormatter(input, {
          indentation: '', // No indentation for minifying
          collapseContent: true, // Collapse content for minifying
          lineSeparator: '' // No line breaks for minifying
        });
      }
      errorMessage = '';
    } catch (e: any) {
      errorMessage = e.message;
      output = '';
    }
  }
</script>

<div class="space-y-3">
  <div>
    <label for="format-type" class="block text-sm font-medium text-retro-text">Format Type</label>
    <select id="format-type" bind:value={formatType} class="block w-full mt-1 border-retro-border rounded-md bg-retro-input-bg text-retro-text focus:ring-retro-primary focus:border-retro-primary sm:text-sm p-2">
      <option value="json">JSON</option>
      <option value="xml">XML</option>
    </select>
  </div>

  {#if effectiveFormat === 'xml'}
  <div class="flex items-center">
    <input id="decode-org-msg" type="checkbox" bind:checked={decodeOrgMsg} class="h-4 w-4 text-retro-primary border-retro-border rounded focus:ring-retro-primary">
    <label for="decode-org-msg" class="ml-2 block text-sm text-retro-text">Decode OrgMsg</label>
  </div>
  {/if}

  <div class="flex space-x-2 mt-4">
    <button on:click={format} class="px-4 py-2 rounded-md font-medium text-retro-text bg-retro-button-bg hover:bg-retro-button-hover">
      Format
    </button>
    <button on:click={minify} class="px-4 py-2 rounded-md font-medium text-retro-text bg-retro-button-bg hover:bg-retro-button-hover">
      Minify
    </button>
  </div>

  {#if errorMessage}
  <div class="mt-2 text-red-400 text-sm">
    Error: {errorMessage}
  </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-4">
    <div>
      <h2 class="text-retro-text">Input</h2>
      <div class="w-full h-full">
        <CodeEditor bind:value={input} lang={effectiveFormat} />
      </div>
    </div>
    <div>
      <h2 class="text-retro-text">Output</h2>
      <div class="w-full h-full">
        <CodeEditor value={output} lang={effectiveFormat} readonly={true} />
      </div>
    </div>
  </div>
</div>

<style>
  /* Removed hard-coded height, now using standard --editor-height from global.css */
</style>
