import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  newsId: number;
  parentId?: number;
  children?: Comment[];
  likes: number;
  createdAt: Date;
  liked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://127.0.0.1:5000/api/comments';

  constructor(private http: HttpClient) {}

  getComments(newsId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?newsId=${newsId}`).pipe(
      map(comments => this.buildCommentTree(comments))
    );
  }

  addComment(comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  updateComment(id: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, { content });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  likeComment(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {});
  }

  private buildCommentTree(comments: Comment[]): Comment[] {
    const map = new Map<number, Comment>();
    const roots: Comment[] = [];

    comments.forEach(comment => {
      map.set(comment.id, { ...comment, children: [] });
    });

    comments.forEach(comment => {
      const node = map.get(comment.id)!;
      if (comment.parentId) {
        const parent = map.get(comment.parentId);
        if (parent) {
          parent.children?.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
} 