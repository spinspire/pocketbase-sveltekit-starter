<script lang="ts" context="module">
  import { writable } from "svelte/store";

  interface Alert {
    message: string;
    type: string;
    timeout?: number;
    html?: boolean;
  }

  export const alerts = {
    ...writable<Alert[]>([]),
    add({ message, type = "info", timeout = 0, html = false }: Alert) {
      const alert = { message, type, html };
      this.update((v) => [...v, alert]);
      if (timeout) {
        setTimeout(() => {
          dismiss(alert);
        }, timeout);
      }
    },
    info(message: string, timeout = 0) {
      this.add({ message, type: "info", timeout });
    },
    success(message: string, timeout = 0) {
      this.add({ message, type: "success", timeout });
    },
    warning(message: string, timeout = 0) {
      this.add({ message, type: "warning", timeout });
    },
    error(message: string, timeout = 0) {
      this.add({ message, type: "error", timeout });
    },
  };

  export function errorAlert(message: string) {
    const type = "error";
  }

  function dismiss(alert: Alert) {
    alerts.update((val) => val.filter((a) => a !== alert));
  }

  function dismissAll() {
    alerts.set([]);
  }
</script>

<svelte:window on:unhandledrejection={(e) => alerts.error(e.reason.toString())} />

<article>
  {#if $alerts.length > 1}
    <button on:click={dismissAll} class="tight">Dismiss All</button>
  {/if}
  {#each $alerts as alert}
    <blockquote class={alert.type}>
      <button on:click={() => dismiss(alert)} class="dismiss">&times;</button>
      {#if alert.html}
        {@html alert.message}
      {:else}
        {alert.message}
      {/if}
    </blockquote>
  {/each}
</article>

<style>
  .dismiss {
    cursor: pointer;
    padding: 0px 5px;
    border-radius: 50%;
  }
  blockquote {
    margin: 0 0;
  }
  .success {
    color: var(--links);
    border-left-color: var(--links);
  }
  .warning {
    color: var(--variable);
    border-left-color: var(--variable);
  }
  .error {
    color: var(--danger);
    border-left-color: var(--danger);
  }
</style>
