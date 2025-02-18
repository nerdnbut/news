import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommentService, Comment } from '../../core/services/comment.service';
import { CommentDialogComponent } from './comment-dialog.component';
import { Subject, debounceTime } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="comment-list">
      <button mat-raised-button color="primary" (click)="addComment()">
        <mat-icon>add_comment</mat-icon>
        添加评论
      </button>

      <ng-container *ngFor="let comment of comments">
        <mat-card class="comment-card">
          <mat-card-header>
            <img mat-card-avatar [src]="comment.author.avatar" [alt]="comment.author.name">
            <mat-card-title>{{comment.author.name}}</mat-card-title>
            <mat-card-subtitle>{{comment.createdAt | date:'yyyy-MM-dd HH:mm'}}</mat-card-subtitle>
            <button mat-icon-button [matMenuTriggerFor]="menu" class="more-button">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="editComment(comment)">
                <mat-icon>edit</mat-icon>
                <span>编辑</span>
              </button>
              <button mat-menu-item (click)="deleteComment(comment)">
                <mat-icon>delete</mat-icon>
                <span>删除</span>
              </button>
              <button mat-menu-item (click)="replyComment(comment)">
                <mat-icon>reply</mat-icon>
                <span>回复</span>
              </button>
            </mat-menu>
          </mat-card-header>
          <mat-card-content>
            <p>{{comment.content}}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="likeComment(comment)" 
                    [class.liked]="comment.liked"
                    class="like-button">
              <mat-icon [@heartBeat]="comment.liked ? 'liked' : 'normal'">
                {{comment.liked ? 'favorite' : 'favorite_border'}}
              </mat-icon>
              <span>{{comment.likes}}</span>
            </button>
          </mat-card-actions>

          <!-- 递归显示子评论 -->
          <div class="nested-comments" *ngIf="comment.children?.length">
            <app-comment-list 
              [comments]="comment.children || []"
              [newsId]="newsId"
              class="nested">
            </app-comment-list>
          </div>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .comment-list {
      padding: 16px;

      .comment-card {
        margin-bottom: 16px;

        .more-button {
          margin-left: auto;
        }

        .like-button {
          display: flex;
          align-items: center;
          gap: 4px;

          &.liked {
            color: #f44336;
          }
        }
      }

      .nested-comments {
        margin-left: 48px;
        margin-top: 16px;
      }

      ::ng-deep .nested {
        .comment-card {
          margin-bottom: 8px;
        }
      }
    }
  `],
  animations: [
    trigger('heartBeat', [
      state('normal', style({ transform: 'scale(1)' })),
      state('liked', style({ transform: 'scale(1.2)' })),
      transition('normal => liked', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition('liked => normal', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class CommentListComponent implements OnInit {
  @Input() newsId!: number;
  @Input() comments: Comment[] = [];

  private likeSubject = new Subject<number>();

  constructor(
    private commentService: CommentService,
    private dialog: MatDialog
  ) {
    // 防抖处理点赞
    this.likeSubject.pipe(
      debounceTime(300)
    ).subscribe(commentId => {
      this.commentService.likeComment(commentId).subscribe();
    });
  }

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.commentService.getComments(this.newsId).subscribe(comments => {
      this.comments = comments;
    });
  }

  addComment() {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
      data: { newsId: this.newsId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.addComment(result).subscribe(() => {
          this.loadComments();
        });
      }
    });
  }

  editComment(comment: Comment) {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
      data: { comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.updateComment(comment.id, result.content).subscribe(() => {
          this.loadComments();
        });
      }
    });
  }

  deleteComment(comment: Comment) {
    if (confirm('确定要删除这条评论吗？')) {
      this.commentService.deleteComment(comment.id).subscribe(() => {
        this.loadComments();
      });
    }
  }

  replyComment(parent: Comment) {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
      data: { newsId: this.newsId, parentId: parent.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.addComment(result).subscribe(() => {
          this.loadComments();
        });
      }
    });
  }

  likeComment(comment: Comment) {
    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;
    this.likeSubject.next(comment.id);
  }
} 