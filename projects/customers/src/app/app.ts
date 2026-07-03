import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  customers = [
    { id: 'C-1001', name: 'John Carter', tier: 'Standard' },
    { id: 'C-1002', name: 'Asha Rao', tier: 'Premium' },
    { id: 'C-1003', name: 'Maya Singh', tier: 'Enterprise' },
  ];
}
