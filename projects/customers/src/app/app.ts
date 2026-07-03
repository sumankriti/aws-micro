import { Component, inject } from '@angular/core';
import { LoggerService } from 'shared-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly logger = inject(LoggerService);

  readonly logs = this.logger.entries;

  customers = [
    { id: 'C-1001', name: 'John Carter', tier: 'Standard' },
    { id: 'C-1002', name: 'Asha Rao', tier: 'Premium' },
    { id: 'C-1003', name: 'Maya Singh', tier: 'Enterprise' },
  ];

  selectCustomer(customerId: string): void {
    const customer = this.customers.find((item) => item.id === customerId);
    this.logger.info('customers', 'Customer selected', customer);
  }
}
