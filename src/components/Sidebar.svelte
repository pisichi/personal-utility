<script lang="ts">
  // In a real app, this could be data-driven and handle complex state.
  const navigation = [
    { name: 'Converter', href: '/personal-utility/', current: true },
    { name: 'Formatter', href: '/personal-utility/formatter', current: false },
    { name: 'Comparator', href: '/personal-utility/comparator', current: false },
  ];
</script>

<div class="hidden md:flex md:flex-shrink-0">
  <div class="flex w-64 flex-col">
    <div class="flex flex-1 flex-col overflow-y-auto border-r border-gray-700 bg-gray-800 pt-5 pb-4">
      <div class="flex flex-shrink-0 items-center px-4">
        <h2 class="text-lg font-semibold text-white">Tools</h2>
      </div>
      <div class="mt-5 flex-1">
        <nav class="flex-1 space-y-1 bg-gray-800 px-2" aria-label="Sidebar">
          {#each navigation as item}
            <a
              href={item.href}
              class="{item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              {item.name}
            </a>
          {/each}
        </nav>
      </div>
    </div>
  </div>
</div>
