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
    MatSnackBarModule
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
    private snackBar: MatSnackBar
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
      const newsData = this.newsForm.value;
      
      const request = this.isEdit ? 
        this.newsService.updateNews(this.route.snapshot.params['id'], newsData) :
        this.newsService.createNews(newsData);

      request.subscribe({
        next: () => {
          this.snackBar.open('保存成功', '关闭', { duration: 3000 });
          this.router.navigate(['/news']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('保存失败', '关闭', { duration: 3000 });
        }
      });
    }
  }

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // 实现图片上传逻辑
    }
  }
} 