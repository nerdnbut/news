import { Component, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-form-field class="category-field" appearance="outline">
      <mat-label>分类</mat-label>
      <mat-chip-grid #chipGrid>
        <mat-chip-row *ngFor="let category of selectedCategories"
                     (removed)="removeCategory(category)">
          {{category.name}}
          <button matChipRemove>
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>
      </mat-chip-grid>
      <input placeholder="选择分类..."
             [matChipInputFor]="chipGrid"
             [matAutocomplete]="auto"
             [formControl]="categoryCtrl">
    </mat-form-field>
    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event)">
      <mat-option *ngFor="let category of filteredCategories" [value]="category">
        {{category.name}}
      </mat-option>
    </mat-autocomplete>
  `,
  styles: [`
    .category-field {
      width: 100%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true
    }
  ]
})
export class CategorySelectorComponent implements OnInit {
  categoryCtrl = new FormControl('');
  selectedCategories: Category[] = [];
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
    this.categoryCtrl.valueChanges.subscribe(value => {
      this.filterCategories(value);
    });
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.allCategories = categories;
      this.filterCategories('');
    });
  }

  private filterCategories(value: string | null) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredCategories = this.allCategories.filter(category => 
      category.name.toLowerCase().includes(filterValue) &&
      !this.selectedCategories.find(c => c.id === category.id)
    );
  }

  selected(event: any) {
    this.selectedCategories.push(event.option.value);
    this.categoryCtrl.setValue('');
    this.onChange(this.selectedCategories);
  }

  removeCategory(category: Category) {
    const index = this.selectedCategories.indexOf(category);
    if (index >= 0) {
      this.selectedCategories.splice(index, 1);
      this.filterCategories('');
      this.onChange(this.selectedCategories);
    }
  }

  // ControlValueAccessor 接口实现
  onChange = (_: any) => {};
  onTouch = () => {};

  writeValue(categories: Category[]): void {
    this.selectedCategories = categories || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
} 