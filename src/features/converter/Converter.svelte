<script lang="ts">
  import CodeEditor from '../../editors/CodeEditor.svelte';

  type FormatType = 'base64' | 'unicode' | 'url';

  let formatType: FormatType = typeof window !== 'undefined' && localStorage.getItem('converterFormat') ? (localStorage.getItem('converterFormat') as FormatType) : 'base64';
  
  // Encode side
  let encodeInput: string = typeof window !== 'undefined' ? localStorage.getItem('converterEncodeInput') || '' : '';
  let encodeOutput: string = '';
  let encodeErrorMsg: string = '';
  let encodeCopyFeedback = false;

  // Decode side
  let decodeInput: string = typeof window !== 'undefined' ? localStorage.getItem('converterDecodeInput') || '' : '';
  let decodeOutput: string = '';
  let decodeErrorMsg: string = '';
  let decodeCopyFeedback = false;

  const formats = [
    { value: 'base64', label: 'Base64' },
    { value: 'unicode', label: 'Unicode' },
    { value: 'url', label: 'URL Encode' },
  ];

  // UTF-8 safe base64 encoding/decoding
  function utf8ToBase64(str: string): string {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.byteLength; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUtf8(str: string): string {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  function encodeFormat(text: string, type: FormatType): string {
    try {
      switch (type) {
        case 'base64':
          return utf8ToBase64(text);
        case 'unicode':
          return text.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
        case 'url':
          return encodeURIComponent(text);
        default:
          return '';
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Encoding failed');
    }
  }

  function decodeFormat(text: string, type: FormatType): string {
    try {
      switch (type) {
        case 'base64':
          return base64ToUtf8(text);
        case 'unicode':
          return text.replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
            String.fromCharCode(parseInt(match.substring(2), 16))
          );
        case 'url':
          return decodeURIComponent(text);
        default:
          return '';
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Decoding failed');
    }
  }

  function copyEncode() {
    if (encodeOutput) {
      navigator.clipboard.writeText(encodeOutput).then(() => {
        encodeCopyFeedback = true;
        setTimeout(() => (encodeCopyFeedback = false), 2000);
      });
    }
  }

  function copyDecode() {
    if (decodeOutput) {
      navigator.clipboard.writeText(decodeOutput).then(() => {
        decodeCopyFeedback = true;
        setTimeout(() => (decodeCopyFeedback = false), 2000);
      });
    }
  }

  $: {
    if (typeof window !== 'undefined') {
      localStorage.setItem('converterFormat', formatType);
      localStorage.setItem('converterEncodeInput', encodeInput);
      localStorage.setItem('converterDecodeInput', decodeInput);
    }
  }

  $: {
    try {
      encodeErrorMsg = '';
      encodeOutput = encodeFormat(encodeInput, formatType);
    } catch (error) {
      encodeErrorMsg = error instanceof Error ? error.message : 'Encoding failed';
      encodeOutput = '';
    }
  }

  $: {
    try {
      decodeErrorMsg = '';
      decodeOutput = decodeFormat(decodeInput, formatType);
    } catch (error) {
      decodeErrorMsg = error instanceof Error ? error.message : 'Decoding failed';
      decodeOutput = '';
    }
  }
</script>

<div class="space-y-4">
  <!-- Format Type Selector -->
  <div>
    <label for="format-type" class="block text-sm font-medium text-retro-text">Format Type</label>
    <select 
      id="format-type"
      bind:value={formatType}
      class="w-full border border-retro-border rounded-md bg-retro-input-bg text-retro-text p-2 text-sm"
    >
      {#each formats as fmt}
        <option value={fmt.value}>{fmt.label}</option>
      {/each}
    </select>
  </div>

  <!-- ENCODE Section -->
  <div>
    <h3 class="text-xs font-semibold text-retro-text mb-2">Encode (Text → {formatType.toUpperCase()})</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <!-- Encode Input -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <label for="encode-input" class="text-xs font-semibold text-retro-text">Input</label>
        </div>
        <div class="border border-retro-border rounded-md overflow-hidden" style="height: 150px;">
          <CodeEditor id="encode-input" bind:value={encodeInput} lang="text" />
        </div>
      </div>

      <!-- Encode Output -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <label for="encode-output" class="text-xs font-semibold text-retro-text">Output</label>
          <!-- <button 
            on:click={copyEncode}
            disabled={!encodeOutput}
            class="px-2 py-1 text-xs rounded font-medium transition-all {encodeCopyFeedback 
              ? 'bg-green-600 text-white' 
              : encodeOutput
              ? 'text-retro-text bg-retro-button-bg hover:bg-retro-button-hover' 
              : 'text-retro-text opacity-50 cursor-not-allowed bg-retro-button-bg'}"
          >
            {encodeCopyFeedback ? '✓ Copied' : 'Copy'}
          </button> -->
        </div>
        <div class="border border-retro-border rounded-md overflow-hidden" style="height: 150px;">
          <CodeEditor id="encode-output" value={encodeOutput} lang="text" readonly={true} />
        </div>
        {#if encodeErrorMsg}
          <div class="mt-1 text-red-400 text-xs">{encodeErrorMsg}</div>
        {/if}
      </div>
    </div>
  </div>

  <!-- DECODE Section -->
  <div>
    <h3 class="text-xs font-semibold text-retro-text mb-2">Decode ({formatType.toUpperCase()} → Text)</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <!-- Decode Input -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <label for="decode-input" class="text-xs font-semibold text-retro-text">Input</label>
        </div>
        <div class="border border-retro-border rounded-md overflow-hidden" style="height: 150px;">
          <CodeEditor id="decode-input" bind:value={decodeInput} lang="text" />
        </div>
      </div>

      <!-- Decode Output -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <label for="decode-output" class="text-xs font-semibold text-retro-text">Output</label>
          <!-- <button 
            on:click={copyDecode}
            disabled={!decodeOutput}
            class="px-2 py-1 text-xs rounded font-medium transition-all {decodeCopyFeedback 
              ? 'bg-green-600 text-white' 
              : decodeOutput
              ? 'text-retro-text bg-retro-button-bg hover:bg-retro-button-hover' 
              : 'text-retro-text opacity-50 cursor-not-allowed bg-retro-button-bg'}"
          >
            {decodeCopyFeedback ? '✓ Copied' : 'Copy'}
          </button> -->
        </div>
        <div class="border border-retro-border rounded-md overflow-hidden" style="height: 150px;">
          <CodeEditor id="decode-output" value={decodeOutput} lang="text" readonly={true} />
        </div>
        {#if decodeErrorMsg}
          <div class="mt-1 text-red-400 text-xs">{decodeErrorMsg}</div>
        {/if}
      </div>
    </div>
  </div>
</div>
