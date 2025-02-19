import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  newsId: number;
  parentId: number | null;
  createdAt: string;
  likes: number;
  liked: boolean;
  children?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(newsId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${newsId}`);
  }

  addComment(comment: {
    content: string;
    newsId: number;
    authorId?: number;
    parentId?: number;
  }): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  likeComment(commentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${commentId}/like`, {});
  }

  unlikeComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}/like`);
  }
} 