import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  invoiceForm = new FormBuilder().group({
    customer: ['John'],
    amount: ['500'],
  });

  status = 'Ready to save invoice locally';

  save() {
    const amount = Number(this.invoiceForm.value.amount);
    this.status = Number.isNaN(amount)
      ? 'Amount must be a number'
      : `Invoice draft saved for ${this.invoiceForm.value.customer}`;
  }
}
