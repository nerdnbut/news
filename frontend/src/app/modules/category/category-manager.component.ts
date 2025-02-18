import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CategoryService, Category } from '../../core/services/category.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="category-manager">
      <div class="header">
        <h2>分类管理</h2>
        <button mat-raised-button color="primary" (click)="addCategory()">
          <mat-icon>add</mat-icon>
          添加分类
        </button>
      </div>

      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
        <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
          <button mat-icon-button disabled></button>
          <span>{{node.name}}</span>
          <div class="actions">
            <button mat-icon-button (click)="editCategory(node)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteCategory(node)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-tree-node>

        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
          <div class="mat-tree-node">
            <button mat-icon-button matTreeNodeToggle>
              <mat-icon>
                {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
              </mat-icon>
            </button>
            <span>{{node.name}}</span>
            <div class="actions">
              <button mat-icon-button (click)="addSubCategory(node)">
                <mat-icon>add</mat-icon>
              </button>
              <button mat-icon-button (click)="editCategory(node)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCategory(node)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
          <div class="nested-node" [class.hidden]="!treeControl.isExpanded(node)">
            <ng-container matTreeNodeOutlet></ng-container>
          </div>
        </mat-nested-tree-node>
      </mat-tree>
    </div>
  `,
  styles: [`
    .category-manager {
      padding: 20px;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .mat-tree {
        background: transparent;
      }

      .mat-tree-node {
        min-height: 48px;
        display: flex;
        align-items: center;
        padding-right: 16px;

        .actions {
          margin-left: auto;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover .actions {
          opacity: 1;
        }
      }

      .nested-node {
        padding-left: 40px;

        &.hidden {
          display: none;
        }
      }
    }
  `]
})
export class CategoryManagerComponent implements OnInit {
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.dataSource.data = this.buildTree(categories);
    });
  }

  private buildTree(categories: Category[]): Category[] {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // 首先创建所有节点的映射
    categories.forEach(category => {
      map.set(category.id, { ...category, children: [] });
    });

    // 构建树结构
    categories.forEach(category => {
      const node = map.get(category.id)!;
      if (category.parentId) {
        const parent = map.get(category.parentId);
        if (parent) {
          parent.children?.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  addCategory() {
    // TODO: 实现添加分类对话框
  }

  addSubCategory(parent: Category) {
    // TODO: 实现添加子分类对话框
  }

  editCategory(category: Category) {
    // TODO: 实现编辑分类对话框
  }

  deleteCategory(category: Category) {
    if (confirm(`确定要删除分类"${category.name}"吗？`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (error) => {
          console.error('删除分类失败', error);
        }
      });
    }
  }
} 