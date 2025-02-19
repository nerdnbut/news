import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NewsService, News } from '../../core/services/news.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatPaginatorModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- 筛选器部分 -->
      <div class="filters">
        <mat-chip-listbox 
          [value]="selectedCategory"
          (change)="onCategoryChange($event)">
          <mat-chip-option 
            [selected]="!selectedCategory"
            value="">
            全部
          </mat-chip-option>
          <mat-chip-option 
            *ngFor="let category of categories"
            [value]="category.value"
            [selected]="category.value === selectedCategory">
            {{category.label}}
          </mat-chip-option>
        </mat-chip-listbox>

        <mat-button-toggle-group 
          [value]="currentSort"
          (change)="onSortChange($event)">
          <mat-button-toggle value="publishDate:desc">
            <mat-icon>schedule</mat-icon>
            最新发布
          </mat-button-toggle>
          <mat-button-toggle value="publishDate:asc">
            <mat-icon>history</mat-icon>
            最早发布
          </mat-button-toggle>
          <mat-button-toggle value="views:desc">
            <mat-icon>trending_up</mat-icon>
            最多浏览
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <!-- 新闻列表部分 -->
      <div class="news-grid">
        <mat-card *ngFor="let news of newsList" class="news-card" 
                  [routerLink]="['/news/detail', news.id]">
          <img mat-card-image [src]="news.coverImage || 'assets/images/default-news.jpg'" 
               [alt]="news.title">
          <mat-card-content>
            <h2 class="news-title">{{news.title}}</h2>
            <div class="news-meta">
              <span class="category">{{news.category}}</span>
              <span class="author">{{news.author}}</span>
              <span class="date">{{news.publishDate | date:'yyyy-MM-dd'}}</span>
            </div>
            <p class="news-excerpt">{{getExcerpt(news.content)}}</p>
          </mat-card-content>
          <mat-card-actions>
            <div class="news-stats">
              <span>
                <mat-icon>visibility</mat-icon>
                {{news.views}}
              </span>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- 分页器 -->
      <mat-paginator
        [length]="total"
        [pageSize]="pageSize"
        [pageIndex]="currentPage - 1"
        [pageSizeOptions]="[12, 24, 36]"
        (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 80px;
    }

    .filters {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .news-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      img {
        height: 200px;
        object-fit: cover;
      }

      .news-title {
        margin: 12px 0;
        font-size: 18px;
        font-weight: 500;
      }

      .news-meta {
        display: flex;
        gap: 12px;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;

        .category {
          color: #1976d2;
        }
      }

      .news-excerpt {
        color: #666;
        margin: 8px 0;
      }

      .news-stats {
        display: flex;
        gap: 16px;
        color: #666;
        font-size: 14px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;

          mat-icon {
            font-size: 16px;
            height: 16px;
            width: 16px;
          }
        }
      }
    }

    mat-paginator {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: white;
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
  `]
})
export class DashboardComponent implements OnInit {
  categories: { label: string; value: string }[] = [];
  selectedCategory: string = '';
  currentSort = 'publishDate:desc';
  newsList: News[] = [];
  currentPage = 1;
  pageSize = 12;
  total = 0;

  constructor(
    private newsService: NewsService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadNews();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        // 将后端分类数据转换为前端所需格式
        this.categories = categories.map(cat => ({
          label: cat.name,
          value: cat.name.toLowerCase()  // 或者使用映射关系
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadNews() {
    console.log('Loading news with category:', this.selectedCategory);
    const [sort, order] = this.currentSort.split(':');
    
    this.newsService.getNewsList({
      category: this.selectedCategory || undefined,
      sort: sort as 'publishDate' | 'views',
      order: order as 'asc' | 'desc',
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.newsList = response.items;
        this.total = response.total;
      },
      error: (error) => {
        console.error('Error loading news:', error);
      }
    });
  }

  onCategoryChange(event: MatChipListboxChange) {
    console.log('Category changed:', event.value);
    this.selectedCategory = event.value;
    this.currentPage = 1;
    this.loadNews();
  }

  onSortChange(event: any) {
    this.currentSort = event.value;
    this.loadNews();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNews();
  }

  getExcerpt(content: string): string {
    return content.replace(/<[^>]*>/g, '').slice(0, 100) + '...';
  }
} 