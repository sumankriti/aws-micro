import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  remotes = [
    {
      name: 'Invoice',
      route: '/invoice',
      localUrl: 'http://localhost:4201',
      deployPath: '/invoice/',
      status: 'remote scaffold',
    },
    {
      name: 'Customers',
      route: '/customers',
      localUrl: 'http://localhost:4202',
      deployPath: '/customers/',
      status: 'remote scaffold',
    },
    {
      name: 'Debugging Lab',
      route: '/debugging',
      localUrl: 'http://localhost:4203',
      deployPath: '/debugging/',
      status: 'training remote',
    },
  ];
}
