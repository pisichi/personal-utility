<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { ChevronDown } from 'lucide-svelte';
  import Button from './Button.svelte';

  type T = $$Generic;

  export let options: { value: T; label: string }[] = [];
  export let value: T;
  export let labelPrefix: string = '';
  export let id: string = Math.random().toString(36).substring(2, 9);
  
  const dispatch = createEventDispatcher<{ change: T }>();

  let isOpen = false;
  let dropdownRef: HTMLDivElement;

  $: currentLabel = options.find(o => o.value === value)?.label || 'Select';

  function toggle() {
    isOpen = !isOpen;
  }

  function selectOption(newValue: T) {
    isOpen = false;
    if (value !== newValue) {
      value = newValue;
      dispatch('change', newValue);
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="relative w-full z-40" bind:this={dropdownRef}>
  <Button variant="custom"
    {id}
    on:click={(e) => { e.stopPropagation(); toggle(); }}
    class="flex items-center justify-between w-full border border-zinc-700 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm px-3 py-2 transition-colors outline-none focus:border-zinc-500 cursor-pointer {$$props.class || ''}"
  >
    <span>{#if labelPrefix}{labelPrefix} {/if}{currentLabel}</span>
    <ChevronDown 
      size={14} 
      strokeWidth={3} 
      class="text-zinc-500 transition-transform duration-200 {isOpen ? 'rotate-180 text-zinc-300' : ''}" 
    />
  </Button>

  {#if isOpen}
    <div 
      transition:slide={{ duration: 200, easing: cubicOut }}
      class="absolute top-full left-0 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-sm shadow-lg overflow-hidden z-50"
    >
      <div class="flex flex-col py-1">
        {#each options as opt}
          <Button variant="custom"
            on:click={(e) => { e.stopPropagation(); selectOption(opt.value); }}
            class="flex items-center px-3 py-2 text-sm font-medium cursor-pointer border-none text-left transition-colors w-full {value === opt.value ? 'bg-zinc-700 text-zinc-100' : 'bg-transparent text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100'}"
          >
            {opt.label}
          </Button>
        {/each}
      </div>
    </div>
  {/if}
</div>
