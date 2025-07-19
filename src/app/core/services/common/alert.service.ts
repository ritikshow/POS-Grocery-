import { Injectable } from "@angular/core";
import { NotifierService } from "angular-notifier";

@Injectable({ providedIn: "root" })
export class AlertService {
  constructor(private notifier: NotifierService) {}

  showInfo(message: string): void {
    this.notifier.show({ type: "info", message: message });
  }
  showSignalRNotification(message: string, customNotificationTmpl: any): void {
    this.notifier.show({
      type: "info",
      message: message,
      template: customNotificationTmpl
    });
  }

  showSuccess(message: string): void {
    this.notifier.show({ type: "success", message: message });
  }

  showWarning(message: string): void {
    this.notifier.show({ type: "warning", message: message });
  }

  showError(message: string): void {
    this.notifier.show({ type: "error", message: message });
  }

  showDefault(message: string): void {
    this.notifier.show({ type: "default", message: message });
  }

  hideAll(): void {
    this.notifier.hideAll();
  }
}
