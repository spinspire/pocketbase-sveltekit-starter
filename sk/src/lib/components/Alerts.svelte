<script lang="ts" module>
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
    <button
      onclick={dismissAll}
      class={`dismiss-all top-round ${_alerts[0].type}`}
      >&times; dismiss all</button
    >
  {/if}
  {#each _alerts as alert}
    <blockquote class={alert.type}>
      <button onclick={() => dismiss(alert)} class="dismiss circle extra"
        >&times;</button
      >
      <span>
        {#if alert.html}
          {@html alert.message}
        {:else}
          {alert.message}
        {/if}
      </span>
    </blockquote>
  {/each}
</article>

<style lang="scss">
  .dismiss-all {
    margin: 0;
    padding: 0.1rem 1rem;
    border-radius: 15px;
  }
  .dismiss {
    font-size: 2rem;
    font-weight: bold;
    padding: 0;
    color: var(--error-container);
    background-color: transparent;
  }
  article {
    background-color: transparent;
    box-shadow: none;
    margin: 0;
    padding: 0;

    blockquote {
      margin: 0 0;
      margin-bottom: 0.5rem;
      padding: 0.5rem 1rem;
      span {
        vertical-align: middle;
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
  }
  .success {
    color: var(--success-text);
    border-left-color: var(--links);
    background-color: var(--success);
  }
  .warning {
    color: var(--warning-text);
    border-left-color: var(--warning-text);
    background-color: var(--warning);
  }
  .error {
    color: var(--danger);
    border-left-color: var(--variable);
  }
  .info {
    color: var(--info-text);
    border-left-color: var(--info-text);
    background-color: var(--info);
  }
</style>
