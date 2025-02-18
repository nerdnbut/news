import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NewsService, News } from '../../../core/services/news.service';
import { CommentListComponent } from '../../comment/comment-list.component';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, CommentListComponent],
  template: `
    <div class="news-detail" *ngIf="news">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{news.title}}</mat-card-title>
          <mat-card-subtitle>
            {{news.author}} · {{news.publishDate | date:'yyyy-MM-dd HH:mm'}}
          </mat-card-subtitle>
        </mat-card-header>
        <img mat-card-image [src]="news.coverImage" [alt]="news.title">
        <mat-card-content>
          <div [innerHTML]="news.content"></div>
        </mat-card-content>
      </mat-card>

      <app-comment-list [newsId]="news.id"></app-comment-list>
    </div>
  `,
  styles: [`
    .news-detail {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;

      mat-card {
        margin-bottom: 20px;
      }
    }
  `]
})
export class NewsDetailComponent implements OnInit {
  news?: News;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      // TODO: 实现获取新闻详情的方法
    }
  }
} 