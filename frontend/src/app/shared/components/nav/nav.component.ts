import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    NotificationBellComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span routerLink="/" style="cursor: pointer">新闻平台</span>
      
      <ng-container *ngIf="authService.isLoggedIn()">
        <button mat-button routerLink="/news/create">发布新闻</button>
        <button mat-button routerLink="/categories">分类管理</button>
      </ng-container>

      <span class="spacer"></span>
      
      <ng-container *ngIf="authService.isLoggedIn(); else loginButton">
        <app-notification-bell *ngIf="authService.isLoggedIn()"></app-notification-bell>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>个人中心</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>退出登录</span>
          </button>
        </mat-menu>
      </ng-container>
      
      <ng-template #loginButton>
        <button mat-button routerLink="/login">登录</button>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    mat-toolbar {
      button {
        margin-left: 8px;
      }
    }
  `]
})
export class NavComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 