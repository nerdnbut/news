import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../core/services/category.service';
import { CategoryFormDialogComponent } from './category-form-dialog.component';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="category-container">
      <div class="header">
        <h2>分类管理</h2>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          新增分类
        </button>
      </div>

      <table mat-table [dataSource]="categories">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>分类名称</th>
          <td mat-cell *matCellDef="let category">{{category.name}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>操作</th>
          <td mat-cell *matCellDef="let category">
            <button mat-icon-button color="warn" (click)="deleteCategory(category)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .category-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
      }
    }

    table {
      width: 100%;
    }
  `]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['name', 'actions'];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = this.flattenCategories(categories);
      },
      error: (error) => {
        this.snackBar.open('加载分类失败', '关闭', { duration: 3000 });
      }
    });
  }

  flattenCategories(categories: Category[]): Category[] {
    let result: Category[] = [];
    categories.forEach(category => {
      result.push(category);
      if (category.children?.length) {
        result = result.concat(this.flattenCategories(category.children));
      }
    });
    return result;
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(category: Category) {
    if (confirm(`确定要删除分类"${category.name}"吗？`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('分类删除成功', '关闭', { duration: 3000 });
          this.loadCategories();
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || '删除失败', 
            '关闭', 
            { duration: 3000 }
          );
        }
      });
    }
  }
} 