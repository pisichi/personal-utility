<script lang="ts">
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { WorkspaceNode } from '../../utils/workspace';
  import Panel from './Panel.svelte';
  import { getWorkspaceStore } from '../../stores/workspace.svelte';

  let { node, isRoot = false } = $props<{ node: WorkspaceNode, isRoot?: boolean }>();

  const store = getWorkspaceStore();

  let isDragging = false;

  function startDrag() {
    isDragging = true;
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging || !node.children) return;
    const container = document.getElementById(`split-${node.id}`);
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let newPercentage: number;
    if (node.direction === 'vertical') {
      newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
    }
    if (newPercentage > 5 && newPercentage < 95) {
      node.percentage = newPercentage;
    }
  }

  function stopDrag() {
    isDragging = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
  }
</script>

<div id="split-{node.id}" class="w-full h-full flex {node.direction === 'horizontal' ? 'flex-col' : 'flex-row'} relative overflow-hidden bg-zinc-900">
  {#if node.type === 'panel' && node.panel}
    <!-- Content Card with Snappy Entry Animation -->
    <div 
      in:scale={{ duration: 350, start: 0.96, opacity: 0, easing: cubicOut }}
      class="flex-1 w-full h-full p-1 min-h-0 min-w-0"
    >
      <Panel 
        panel={node.panel} 
        isOnlyPanel={isRoot}
        on:update={(e) => store.updatePanel(node, e.detail)}
        on:split={(e) => store.splitNode(node, e.detail.direction)}
        on:remove={() => store.removeNode(node.id)}
        on:duplicate={() => store.duplicateNode(node)}
      />
    </div>
  {:else if node.children}
    <div 
      class="min-h-0 min-w-0" 
      style="{node.direction === 'vertical' ? `width: ${node.percentage}%` : `height: ${node.percentage}%`}"
    >
      <svelte:self node={node.children[0]} />
    </div>

    <!-- Enhanced Resizer -->
    <button 
      type="button"
      aria-label="Resize panels"
      on:mousedown={startDrag}
      on:keydown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            node.percentage = Math.max(5, (node.percentage || 50) - 2);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            node.percentage = Math.min(95, (node.percentage || 50) + 2);
        }
      }}
      class="flex items-center justify-center bg-zinc-900 hover:bg-blue-600 transition-colors z-20 relative group border-none p-0 outline-none shrink-0
             {node.direction === 'vertical' ? 'w-1 cursor-col-resize h-full' : 'h-1 cursor-row-resize w-full'}"
    >
      <div class="absolute bg-zinc-700 group-hover:bg-white transition-colors
                  {node.direction === 'vertical' ? 'w-[1px] h-12' : 'h-[1px] w-12'}"></div>
    </button>

    <div class="flex-1 min-h-0 min-w-0">
      <svelte:self node={node.children[1]} />
    </div>
  {/if}
</div>

<style>
  :global(.flex-1) {
    min-width: 0;
    min-height: 0;
  }
</style>
