import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoggerService } from 'shared-core';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly logger = inject(LoggerService);

  readonly logs = this.logger.entries;

  invoiceForm = new FormBuilder().group({
    customer: ['John'],
    amount: ['500'],
  });

  status = 'Ready to save invoice locally';

  save() {
    const amount = Number(this.invoiceForm.value.amount);

    if (Number.isNaN(amount)) {
      this.status = 'Amount must be a number';
      this.logger.warn('invoice', 'Invoice save rejected because amount is invalid', {
        amount: this.invoiceForm.value.amount,
      });
      return;
    }

    this.status = `Invoice draft saved for ${this.invoiceForm.value.customer}`;
    this.logger.info('invoice', 'Invoice draft saved', {
      customer: this.invoiceForm.value.customer,
      amount,
    });
  }
}
