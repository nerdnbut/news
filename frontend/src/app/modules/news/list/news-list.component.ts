import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NewsService, News } from '../../../core/services/news.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class NewsListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'category', 'author', 'publishDate', 'views', 'actions'];
  dataSource: News[] = [];
  total = 0;
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<News>;

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.newsService.getNews({
      page: this.paginator?.pageIndex || 0,
      pageSize: this.paginator?.pageSize || 10,
      sort: this.sort?.active,
      order: this.sort?.direction as 'asc' | 'desc'
    }).subscribe({
      next: (response) => {
        this.dataSource = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('加载新闻列表失败', error);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // 实现过滤逻辑
  }

  onDelete(id: number) {
    if (confirm('确定要删除这条新闻吗？')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.loadNews();
        },
        error: (error) => {
          console.error('删除新闻失败', error);
        }
      });
    }
  }
} 