import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>新增分类</h2>
    <mat-dialog-content>
      <form [formGroup]="categoryForm">
        <mat-form-field>
          <mat-label>分类名称</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">取消</button>
      <button mat-raised-button color="primary" 
              [disabled]="categoryForm.invalid || loading"
              (click)="onSubmit()">
        确定
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
      padding-top: 16px;
    }
  `]
})
export class CategoryFormDialogComponent {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.loading = true;
      this.categoryService.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.snackBar.open('分类创建成功', '关闭', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.error?.message || '创建失败', 
            '关闭', 
            { duration: 3000 }
          );
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 