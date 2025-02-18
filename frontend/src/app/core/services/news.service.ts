import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface News {
  id: number;
  title: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  publishDate: Date;
  views: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://127.0.0.1:5000/api/news';

  constructor(private http: HttpClient) {}

  getNews(params: {
    page: number;
    pageSize: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: string;
  }): Observable<{ items: News[]; total: number }> {
    return this.http.get<{ items: News[]; total: number }>(this.apiUrl, { params: params as any });
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