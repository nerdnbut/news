import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NewsService } from '../../../core/services/news.service';
import { CommentService, Comment } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="news-detail-container">
      <mat-card *ngIf="news">
        <mat-card-header>
          <mat-card-title>{{news.title}}</mat-card-title>
          <mat-card-subtitle>
            <span>作者: {{news.author}}</span>
            <span class="separator">|</span>
            <span>分类: {{news.category}}</span>
            <span class="separator">|</span>
            <span>发布时间: {{news.publishDate | date:'yyyy-MM-dd HH:mm'}}</span>
            <span class="separator">|</span>
            <span>浏览: {{news.views}}</span>
          </mat-card-subtitle>
        </mat-card-header>
        
        <img *ngIf="news.coverImage" mat-card-image [src]="news.coverImage" [alt]="news.title">
        
        <mat-card-content>
          <div class="news-content" [innerHTML]="news.content"></div>
        </mat-card-content>

        <mat-card-actions *ngIf="isAuthor">
          <button mat-button color="primary" [routerLink]="['/news/edit', news.id]">
            <mat-icon>edit</mat-icon>
            编辑
          </button>
          <button mat-button color="warn" (click)="deleteNews()">
            <mat-icon>delete</mat-icon>
            删除
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- 评论部分 -->
      <mat-card class="comments-section">
        <mat-card-header>
          <mat-card-title>评论</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- 评论输入框 -->
          <form *ngIf="authService.isLoggedIn()" [formGroup]="commentForm" (ngSubmit)="submitComment()">
            <mat-form-field>
              <mat-label>写下你的评论</mat-label>
              <textarea matInput formControlName="content" rows="3"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" 
                      [disabled]="commentForm.invalid || loading">
                发表评论
              </button>
            </div>
          </form>

          <div *ngIf="!authService.isLoggedIn()" class="login-prompt">
            <a routerLink="/login" [queryParams]="{returnUrl: currentUrl}">登录</a>
            后参与评论
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <ng-container *ngFor="let comment of comments">
              <div class="comment-item">
                <div class="comment-header">
                  <img [src]="comment.author.avatar || 'assets/images/default-avatar.png'" 
                       [alt]="comment.author.name"
                       class="avatar">
                  <span class="author-name">{{comment.author.name}}</span>
                  <span class="comment-date">
                    {{comment.createdAt | date:'yyyy-MM-dd HH:mm'}}
                  </span>
                </div>
                
                <div class="comment-content">
                  {{comment.content}}
                </div>
                
                <div class="comment-actions">
                  <button mat-button (click)="toggleReply(comment)">
                    <mat-icon>reply</mat-icon>
                    回复
                  </button>
                  <button mat-button (click)="toggleLike(comment)"
                          [class.liked]="comment.liked">
                    <mat-icon>thumb_up</mat-icon>
                    {{comment.likes}}
                  </button>
                </div>

                <!-- 回复框 -->
                <form *ngIf="replyingTo === comment.id" 
                      [formGroup]="replyForm"
                      (ngSubmit)="submitReply(comment.id)"
                      class="reply-form">
                  <mat-form-field>
                    <mat-label>回复 {{comment.author.name}}</mat-label>
                    <textarea matInput formControlName="content" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-button type="button" (click)="cancelReply()">
                      取消
                    </button>
                    <button mat-raised-button color="primary" 
                            [disabled]="replyForm.invalid || loading">
                      回复
                    </button>
                  </div>
                </form>

                <!-- 子评论 -->
                <div class="child-comments" *ngIf="comment.children?.length">
                  <div class="comment-item child" *ngFor="let child of comment.children">
                    <div class="comment-header">
                      <img [src]="child.author.avatar || 'assets/images/default-avatar.png'" 
                           [alt]="child.author.name"
                           class="avatar">
                      <span class="author-name">{{child.author.name}}</span>
                      <span class="comment-date">
                        {{child.createdAt | date:'yyyy-MM-dd HH:mm'}}
                      </span>
                    </div>
                    
                    <div class="comment-content">
                      {{child.content}}
                    </div>
                    
                    <div class="comment-actions">
                      <button mat-button (click)="toggleLike(child)"
                              [class.liked]="child.liked">
                        <mat-icon>thumb_up</mat-icon>
                        {{child.likes}}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .news-detail-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .separator {
      margin: 0 8px;
      color: #999;
    }

    .news-content {
      margin-top: 20px;
      line-height: 1.6;
    }

    mat-card-subtitle {
      margin-top: 8px;
      
      span {
        font-size: 14px;
      }
    }

    img {
      max-height: 400px;
      object-fit: cover;
    }

    .comments-section {
      margin-top: 20px;
    }

    .comment-item {
      margin: 16px 0;
      padding: 16px;
      border-bottom: 1px solid #eee;

      &.child {
        margin-left: 48px;
        background: #f9f9f9;
        border-radius: 4px;
        border: none;
      }
    }

    .comment-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .author-name {
        font-weight: 500;
        margin-right: 8px;
      }

      .comment-date {
        color: #666;
        font-size: 12px;
      }
    }

    .comment-content {
      margin: 8px 0;
      white-space: pre-wrap;
    }

    .comment-actions {
      display: flex;
      gap: 8px;

      button {
        color: #666;

        &.liked {
          color: #1976d2;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 4px;
        }
      }
    }

    form {
      margin: 16px 0;
      
      mat-form-field {
        width: 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .reply-form {
      margin-left: 40px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .login-prompt {
      text-align: center;
      padding: 16px;
      color: #666;

      a {
        color: #1976d2;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class NewsDetailComponent implements OnInit {
  news: any;
  isAuthor = false;
  comments: Comment[] = [];
  commentForm: FormGroup;
  replyForm: FormGroup;
  replyingTo: number | null = null;
  loading = false;
  currentUrl: string;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private commentService: CommentService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });

    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });

    this.currentUrl = window.location.pathname;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.newsService.getNewsById(parseInt(id)).subscribe(news => {
        this.news = news;
        const currentUser = this.authService.getCurrentUser();
        this.isAuthor = currentUser?.id === news.authorId;
        this.loadComments();
      });
    }
  }

  loadComments() {
    if (this.news?.id) {
      this.commentService.getComments(this.news.id).subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
    }
  }

  submitComment() {
    if (this.commentForm.valid && this.news) {
      this.loading = true;
      const currentUser = this.authService.getCurrentUser();
      
      this.commentService.addComment({
        content: this.commentForm.value.content,
        newsId: this.news.id,
        authorId: currentUser?.id
      }).subscribe({
        next: () => {
          this.loading = false;
          this.commentForm.reset();
          this.loadComments();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  toggleReply(comment: Comment) {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    this.replyingTo = this.replyingTo === comment.id ? null : comment.id;
    this.replyForm.reset();
  }

  submitReply(parentId: number) {
    if (this.replyForm.valid && this.news) {
      this.loading = true;
      const currentUser = this.authService.getCurrentUser();
      
      this.commentService.addComment({
        content: this.replyForm.value.content,
        newsId: this.news.id,
        parentId,
        authorId: currentUser?.id
      }).subscribe({
        next: () => {
          this.loading = false;
          this.replyForm.reset();
          this.replyingTo = null;
          this.loadComments();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyForm.reset();
  }

  toggleLike(comment: Comment) {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    
    const request = comment.liked ?
      this.commentService.unlikeComment(comment.id) :
      this.commentService.likeComment(comment.id);

    request.subscribe(() => {
      comment.liked = !comment.liked;
      comment.likes += comment.liked ? 1 : -1;
    });
  }

  deleteNews() {
    if (confirm('确定要删除这篇新闻吗？')) {
      this.newsService.deleteNews(this.news.id).subscribe(() => {
        // 删除成功后返回首页
        window.history.back();
      });
    }
  }
} 