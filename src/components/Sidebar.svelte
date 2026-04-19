<script lang="ts">
  const navigation = [
    { name: 'CONVERTER', href: '/personal-utility/', current: true },
    { name: 'FORMATTER', href: '/personal-utility/formatter', current: false },
    { name: 'COMPARATOR', href: '/personal-utility/comparator', current: false },
  ];
</script>

<div class="hidden md:flex md:flex-shrink-0">
  <div class="flex w-56 flex-col">
    <div class="flex flex-1 flex-col overflow-y-auto border-r border-retro-border bg-retro-bg pt-8 pb-4">
      <div class="flex flex-shrink-0 items-center px-6 mb-8">
        <h2 class="text-sm font-bold text-retro-primary uppercase tracking-[0.2em] border-b border-retro-primary/30 pb-1">Toolkit</h2>
      </div>
      <div class="flex-1 px-4">
        <nav class="space-y-2" aria-label="Sidebar">
          {#each navigation as item}
            <a
              href={item.href}
              class="group flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border border-transparent rounded-sm {item.current ? 'bg-retro-input-bg text-retro-primary border-retro-border/50' : 'text-retro-text opacity-60 hover:opacity-100 hover:text-retro-primary hover:bg-retro-input-bg/50'}"
            >
              {item.name}
            </a>
          {/each}
        </nav>
      </div>
    </div>
  </div>
</div>
