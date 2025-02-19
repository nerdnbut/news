import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <mat-icon [matBadge]="unreadCount" 
                [matBadgeHidden]="unreadCount === 0"
                matBadgeColor="warn">
        notifications
      </mat-icon>
    </button>
    
    <mat-menu #menu="matMenu" class="notification-menu">
      <div class="notification-header">
        <h3>通知</h3>
      </div>
      
      <div class="notification-list" *ngIf="notifications.length > 0">
        <a mat-menu-item *ngFor="let notification of notifications"
           [routerLink]="['/news/detail', notification.newsId]"
           (click)="markAsRead(notification)"
           [class.unread]="!notification.read">
          <mat-icon>article</mat-icon>
          <span class="notification-content">
            <span class="title">{{notification.newsTitle}}</span>
            <span class="category">{{notification.newsCategory}}</span>
            <span class="time">
              {{notification.createdAt | date:'yyyy-MM-dd HH:mm'}}
            </span>
          </span>
        </a>
      </div>
      
      <div class="no-notifications" *ngIf="notifications.length === 0">
        暂无通知
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-menu {
      max-width: 360px;
    }

    .notification-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      
      h3 {
        margin: 0;
        font-size: 16px;
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .title {
        font-weight: 500;
      }
      
      .category {
        color: #1976d2;
        font-size: 12px;
      }
      
      .time {
        color: #666;
        font-size: 12px;
      }
    }

    .unread {
      background-color: #f5f5f5;
      
      &:hover {
        background-color: #eeeeee;
      }
    }

    .no-notifications {
      padding: 16px;
      text-align: center;
      color: #666;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadNotifications();
    // 每分钟刷新一次通知
    setInterval(() => this.loadNotifications(), 60000);
  }

  loadNotifications() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.notificationService.getNotifications(currentUser.id).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadCount = notifications.filter(n => !n.read).length;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }
} 