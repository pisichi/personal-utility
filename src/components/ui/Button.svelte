<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled: boolean = false;
  export let title: string = '';
  export let ariaLabel: string = title;
  export let variant: 'primary' | 'secondary' | 'icon' | 'ghost' | 'custom' = 'primary';
  const dispatch = createEventDispatcher<{ click: MouseEvent }>();

  const baseClasses = "transition-all cursor-pointer border-none flex items-center justify-center outline-none";
  const variants = {
    primary: "px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-sm shadow-sm border border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed space-x-2",
    secondary: "px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-sm border border-zinc-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed space-x-2",
    icon: "p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed",
    ghost: "bg-transparent hover:bg-transparent text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed p-0",
    custom: ""
  };
</script>

<button 
  {disabled}
  {title}
  aria-label={ariaLabel}
  on:click={(e) => dispatch('click', e)}
  class="{baseClasses} {variants[variant]} {$$props.class || ''}"
>
  <slot />
</button>
