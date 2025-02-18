import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <mat-card class="stat-card">
        <mat-card-header>
          <mat-card-title>新闻总数</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            <mat-icon>article</mat-icon>
            <span>123</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-header>
          <mat-card-title>今日浏览</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            <mat-icon>visibility</mat-icon>
            <span>456</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-header>
          <mat-card-title>评论数</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            <mat-icon>comment</mat-icon>
            <span>789</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .stat-card {
      .stat-value {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 2rem;
        padding: 20px;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
        }
      }
    }
  `]
})
export class DashboardComponent {} 