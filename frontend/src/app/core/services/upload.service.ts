import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(this.apiUrl, formData);
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    // 如果已经是完整URL，直接返回
    if (path.startsWith('http')) {
      return path;
    }
    // 确保path以/开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    // 使用后端服务器地址
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
} 