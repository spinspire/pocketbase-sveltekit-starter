<script lang="ts" context="module">
  import { writable } from "svelte/store";

  interface Alert {
    message: string;
    type: string;
    timeout?: number;
  }

  export const alerts = {
    ...writable<Alert[]>([]),
    add({ message, type = "info", timeout = 0 }: Alert) {
      const alert = { message, type };
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
</script>

<article>
  {#each $alerts as alert}
    <blockquote class={alert.type}>
      <button on:click={() => dismiss(alert)} class="dismiss">&times;</button>
      {alert.message}
    </blockquote>
  {/each}
</article>

<style lang="scss">
  .dismiss {
    padding: 0;
    border-radius: 50%;
    height: 2em;
    width: 2em;
  }
  blockquote.error {
    color: red;
  }
  blockquote.warning {
    color: yellowgreen;
  }
</style>
