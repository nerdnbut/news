import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from './shared/components/nav/nav.component';
import { LoginComponent } from './modules/user/login/login.component';

@Component({
  selector: 'app-root',
  template: `
    <app-nav *ngIf="showNav"></app-nav>
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent, LoginComponent]
})
export class AppComponent {
  get showNav(): boolean {
    return window.location.pathname !== '/login';
  }
}
