<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu } from 'lucide-svelte';

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function resetWorkspace() {
    if (confirm("Reset layout to default?")) {
      localStorage.removeItem('personal-utility-workspace');
      window.location.reload();
    }
  }
</script>

<nav class="bg-[#09090b] border-b border-zinc-800 shrink-0">
  <div class="mx-auto px-4">
    <div class="flex h-10 items-center justify-between">
      <div class="flex items-center space-x-4">
        <span class="text-[10px] font-bold text-zinc-100 tracking-[0.2em] uppercase">Utility::Toolkit</span>
        
        <div class="hidden md:flex h-3 w-[1px] bg-zinc-800"></div>
        
        <button 
          on:click={resetWorkspace}
          class="text-[9px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
        >
          Reset Workspace
        </button>
      </div>

      <div class="-mr-2 flex md:hidden">
        <button on:click={toggleMenu} type="button" class="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors" aria-label="Open menu">
          <Menu size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  </div>

  {#if isMenuOpen}
    <div class="md:hidden bg-zinc-900 border-t border-zinc-800 px-6 py-4 shadow-2xl" id="mobile-menu">
      <div class="flex flex-col space-y-4">
        <button 
          on:click={resetWorkspace}
          class="text-left text-zinc-400 hover:text-white text-[10px] font-medium uppercase tracking-widest"
        >
          Reset Workspace
        </button>
      </div>
    </div>
  {/if}
</nav>