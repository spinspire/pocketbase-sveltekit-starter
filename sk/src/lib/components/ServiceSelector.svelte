<script lang="ts">
    export let selectedService: string;
    export let selectedModel: string;
  
    const services = [
      {
        name: "Anthropic",
        models: [
          "claude-3-haiku-20240307",
          "claude-3-sonnet-20240229",
          "claude-3-opus-20240229",
          "claude-2.1",
          "claude-2.0",
          "claude-instant-1.2",
        ],
      },
      {
        name: "OpenAI",
        models: ["gpt-4-turbo-preview", "gpt-3.5-turbo"],
      },
    ];
  </script>
  
  <div>
    <select
      class="select select-ghost w-full max-w-xs"
      bind:value={selectedService}
    >
      {#each services as service, i}
        <option value={service.name} selected={i === 0}>{service.name}</option>
      {/each}
    </select>
  
    {#if selectedService}
      <select
        class="select select-ghost w-full max-w-xs"
        bind:value={selectedModel}
      >
        {#each services.find(s => s.name === selectedService)?.models ?? [] as model, i}
          <option value={model} selected={i === 0}>{model}</option>
        {/each}
      </select>
    {/if}
  </div>