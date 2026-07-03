import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InvoiceService } from './services/invoice.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [InvoiceService],
  templateUrl: './app.html'
})
export class App {

  private fb = inject(FormBuilder);

  private invoiceService = inject(InvoiceService);

  loading = false;

  message = '';

  invoiceForm = this.fb.group({

    customer: ['John'],

    amount: ['500']

  });

  save() {

    this.loading = true;

    const payload = {

      customer: this.invoiceForm.value.customer,

      amount: Number(this.invoiceForm.value.amount)

    };

    this.invoiceService
      .save(payload)
      .subscribe({

        next: (response: any) => {

          this.message = response.message;

          this.loading = false;

        },

        error: () => {

          this.message = 'Save Failed';

          this.loading = false;

        }

      });

  }

}