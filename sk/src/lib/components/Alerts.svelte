<script lang="ts" context="module">
  interface Alert {
    message: string;
    type: string;
    timeout?: number;
    html?: boolean;
  }

  let _alerts = $state<Alert[]>([]);
  export const alerts = {
    add({ message, type = "info", timeout = 0, html = false }: Alert) {
      const alert = { message, type, html };
      _alerts = _alerts.concat(alert);
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
    _alerts = _alerts.filter((a) => a !== alert);
  }

  function dismissAll() {
    _alerts = [];
  }
  function onunhandledrejection(e: PromiseRejectionEvent) {
    alerts.error(e.reason.toString());
    const { data = {} } = e.reason.response ?? {};
    for (const [key, value] of Object.entries(data)) {
      alerts.error(`${key}: ${value?.message}`);
    }
  }
</script>

<!-- to display alerts for unhandled promise rejections -->
<svelte:window {onunhandledrejection} />

<article>
  {#if _alerts.length > 1}
    <button onclick={dismissAll} class="dismiss">&times; dismiss all</button>
  {/if}
  {#each _alerts as alert}
    <blockquote class={alert.type}>
      <button onclick={() => dismiss(alert)} class="dismiss">&times;</button>
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
    padding: 2px 7px;
    border-radius: 15px;
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
    border-left-color: var(--selection);
  }
  .error {
    color: var(--danger);
    border-left-color: var(--variable);
  }
</style>
