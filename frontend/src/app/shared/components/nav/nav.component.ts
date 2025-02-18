import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <mat-toolbar color="primary">
      <span>新闻管理系统</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/news">新闻列表</button>
      <button mat-button routerLink="/news/create">创建新闻</button>
      <button mat-button (click)="logout()">退出</button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class NavComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
} 