import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface News {
  id: number;
  title: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  authorId: number;
  publishDate: Date;
  views: number;
}

export interface NewsFilter {
  category?: string;
  sort?: 'publishDate' | 'views';
  order?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  getNewsList(params: {
    page: number;
    pageSize: number;
    sort?: string;
    order?: string;
    category?: string;
  }): Observable<{ items: News[]; total: number }> {
    const queryParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sort', params.sort || 'publishDate')
      .set('order', params.order || 'desc')
      .set('category', params.category || '');

    return this.http.get<{ items: News[]; total: number }>(
      this.apiUrl,
      { params: queryParams }
    );
  }

  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  createNews(news: Partial<News>): Observable<News> {
    return this.http.post<News>(this.apiUrl, news);
  }

  updateNews(id: number, news: Partial<News>): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, news);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 