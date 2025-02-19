import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsService } from '../../../core/services/news.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UploadService } from '../../../core/services/upload.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-news-editor',
  templateUrl: './news-editor.component.html',
  styleUrls: ['./news-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ]
})
export class NewsEditorComponent implements OnInit {
  newsForm: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private uploadService: UploadService
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['', [Validators.required]],
      coverImage: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadNews(id);
    }
  }

  loadNews(id: number) {
    // 加载新闻详情
  }

  onSubmit() {
    if (this.newsForm.valid) {
      this.loading = true;
      const currentUser = this.authService.getCurrentUser();
      
      const newsData = {
        ...this.newsForm.value,
        authorId: currentUser?.id
      };

      this.newsService.createNews(newsData).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('新闻发布成功', '关闭', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.error?.message || '发布失败', 
            '关闭', 
            { duration: 3000 }
          );
        }
      });
    }
  }

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          this.newsForm.patchValue({
            coverImage: response.url
          });
          this.snackBar.open('图片上传成功', '关闭', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.snackBar.open(
            error.error?.error || '图片上传失败', 
            '关闭', 
            { duration: 3000 }
          );
        }
      });
    }
  }

  createNews() {
    if (this.newsForm.valid) {
      const formData = this.newsForm.value;
      const currentUser = this.authService.getCurrentUser();
      
      const newsData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        coverImage: formData.coverImage,
        author: currentUser ? currentUser.username : 'Anonymous',
        authorId: currentUser ? currentUser.id : null
      };

      this.newsService.createNews(newsData).subscribe({
        next: (response) => {
          this.snackBar.open('新闻发布成功', '关闭', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating news:', error);
          this.snackBar.open(error.error?.message || '发布失败', '关闭', { duration: 3000 });
        }
      });
    }
  }
} 