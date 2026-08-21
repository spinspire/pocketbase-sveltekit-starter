import { writable, type Writable } from "svelte/store";

interface Alert {
  message: string;
  type: string;
  timeout?: number;
  html?: boolean;
}

interface AlertsStore extends Writable<Alert[]> {
  add(alert: Alert): void;
  info(message: string, timeout?: number): void;
  success(message: string, timeout?: number): void;
  warning(message: string, timeout?: number): void;
  error(message: string, timeout?: number): void;
  dismiss(alert: Alert): void;
  dismissAll(): void;
}

function createAlerts(): AlertsStore {
  const { subscribe, update, set } = writable<Alert[]>([]);

  function dismiss(alert: Alert) {
    update((alerts) => alerts.filter((a) => a !== alert));
  }

  return {
    subscribe,
    add({ message, type = "info", timeout = 0, html = false }: Alert) {
      const alert = { message, type, html };
      update((alerts) => [...alerts, alert]);
      if (timeout) {
        setTimeout(() => dismiss(alert), timeout);
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
    dismiss,
    dismissAll() {
      set([]);
    },
  };
}

export const alerts = createAlerts();
