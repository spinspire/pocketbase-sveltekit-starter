<script>
    import { onMount } from 'svelte';
  
    /**
     * @type {any[]}
     */
    export let treeData = [];
    /**
     * @type {any[]}
     */
    let selectedNodes = [];
  
    onMount(async () => {
      // Fetch the JSON data from a file or API
      //const response = await fetch('path/to/your/data.json');
      //treeData = await response.json();
    });
  
    /**
     * @param {any} node
     */
    function toggleNode(node) {
      const index = selectedNodes.indexOf(node);
      if (index > -1) {
        selectedNodes.splice(index, 1);
      } else {
        selectedNodes.push(node);
        selectChildren(node);
      }
      selectedNodes = [...selectedNodes];
    }
  
    /**
     * @param {{ children: any[]; }} node
     */
    function selectChildren(node) {
      if (node.children) {
        node.children.forEach((/** @type {any} */ child) => {
          if (!selectedNodes.includes(child)) {
            selectedNodes.push(child);
            selectChildren(child);
          }
        });
      }
    }
  </script>
  
  <ul class="pl-4">
    {#each treeData as node}
      <li class="mb-2">
        <label class="flex items-center">
          <input type="checkbox" class="checkbox checkbox-primary" on:change={() => toggleNode(node)} checked={selectedNodes.includes(node)}>
          <span class="ml-2">{node.name}</span>
        </label>
        {#if node.children}
          <svelte:self treeData={node.children} bind:selectedNodes />
        {/if}
      </li>
    {/each}
  </ul>