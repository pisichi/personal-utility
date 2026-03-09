<script lang="ts">
  import { onMount } from 'svelte';

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  onMount(() => {
    // Optional: Add event listeners or other logic on mount
  });
</script>

<nav class="bg-retro-bg border-b border-retro-border">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <a href="/personal-utility/" class="text-retro-text hover:text-retro-primary px-3 py-2 rounded-md text-sm font-medium">Converter</a>
            <a href="/personal-utility/formatter" class="text-retro-text hover:text-retro-primary px-3 py-2 rounded-md text-sm font-medium">Formatter</a>
            <a href="/personal-utility/comparator" class="text-retro-text hover:text-retro-primary px-3 py-2 rounded-md text-sm font-medium">Comparator</a>
          </div>
        </div>
      </div>
      <div class="-mr-2 flex md:hidden">
        <button on:click={toggleMenu} type="button" class="inline-flex items-center justify-center p-2 rounded-md text-retro-text hover:bg-retro-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-retro-primary" aria-controls="mobile-menu" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          {#if !isMenuOpen}
            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {:else}
            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>

  {#if isMenuOpen}
    <div class="md:hidden bg-retro-bg p-4 border-t border-retro-border" id="mobile-menu">
      <div class="space-y-1">
        <a href="/personal-utility/" class="text-retro-text hover:text-retro-primary block px-3 py-2 rounded-md text-base font-medium">Converter</a>
        <a href="/personal-utility/formatter" class="text-retro-text hover:text-retro-primary block px-3 py-2 rounded-md text-base font-medium">Formatter</a>
        <a href="/personal-utility/comparator" class="text-retro-text hover:text-retro-primary block px-3 py-2 rounded-md text-base font-medium">Comparator</a>
      </div>
    </div>
  {/if}
</nav>
