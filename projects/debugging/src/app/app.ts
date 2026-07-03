import { Component, computed, inject, signal } from '@angular/core';
import { LoggerService } from 'shared-core';

interface DebugEvent {
  readonly id: number;
  readonly panel: 'Console' | 'Sources' | 'Network' | 'Application' | 'Performance';
  readonly message: string;
  readonly timestamp: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly logger = inject(LoggerService);
  private nextId = 1;

  readonly events = signal<readonly DebugEvent[]>([]);
  readonly logs = this.logger.entries;
  readonly savedStudentName = signal(localStorage.getItem('debugging.student') ?? 'Kriti');
  readonly networkStatus = signal('No network drill has run yet.');
  readonly performanceResult = signal('No performance drill has run yet.');
  readonly completedCount = computed(() => this.events().length);

  logConsoleDrill(): void {
    const data = {
      app: 'debugging',
      skill: 'console filtering',
      level: 'info',
    };

    this.logger.info('debugging', 'Console drill executed', data);
    console.table([data]);
    this.record('Console', 'Logged a structured event and table. Filter Console by "debugging".');
  }

  triggerBreakpointDrill(): void {
    const invoiceTotal = this.calculateInvoiceTotal(1250, 0.18);
    this.logger.debug('debugging', 'Breakpoint drill calculated invoice total', { invoiceTotal });
    this.record('Sources', `Calculated invoice total ${invoiceTotal}. Set a breakpoint in calculateInvoiceTotal().`);
  }

  async triggerNetworkDrill(): Promise<void> {
    this.networkStatus.set('Calling a fake API endpoint...');

    try {
      const response = await fetch('/api/debugging-lab/orders/42');
      this.networkStatus.set(`Unexpected response: ${response.status}`);
    } catch (error) {
      this.networkStatus.set('Expected failure. Inspect the failed request in Network.');
      this.logger.warn('debugging', 'Network drill failed as expected', error);
    }

    this.record('Network', 'Triggered a fake API request. Inspect status, initiator, and timing.');
  }

  saveApplicationState(studentName: string): void {
    const name = studentName.trim() || 'Kriti';
    localStorage.setItem('debugging.student', name);
    this.savedStudentName.set(name);
    this.logger.info('debugging', 'Saved student name to localStorage', { name });
    this.record('Application', 'Saved state to localStorage. Inspect Application > Local Storage.');
  }

  runPerformanceDrill(): void {
    const started = performance.now();
    let checksum = 0;

    for (let index = 0; index < 2_000_000; index += 1) {
      checksum += Math.sqrt(index) % 7;
    }

    const duration = Math.round(performance.now() - started);
    this.performanceResult.set(`CPU drill took ${duration}ms. Check Performance for scripting time.`);
    this.logger.info('debugging', 'Performance drill completed', { duration, checksum: Math.round(checksum) });
    this.record('Performance', `Created a small CPU task lasting ${duration}ms.`);
  }

  clearDrills(): void {
    this.events.set([]);
    this.networkStatus.set('No network drill has run yet.');
    this.performanceResult.set('No performance drill has run yet.');
    this.logger.info('debugging', 'Debugging lab state cleared');
  }

  private calculateInvoiceTotal(subtotal: number, taxRate: number): number {
    const tax = subtotal * taxRate;
    return Math.round((subtotal + tax) * 100) / 100;
  }

  private record(panel: DebugEvent['panel'], message: string): void {
    const event: DebugEvent = {
      id: this.nextId,
      panel,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    this.nextId += 1;
    this.events.update((events) => [event, ...events].slice(0, 12));
  }
}
