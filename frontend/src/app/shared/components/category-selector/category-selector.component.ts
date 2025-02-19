import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true
    }
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>分类</mat-label>
      <mat-select [(value)]="selectedValue" (selectionChange)="onChange($event.value)">
        <mat-option *ngFor="let category of categories" [value]="category.name">
          {{category.name}}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
  `]
})
export class CategorySelectorComponent implements ControlValueAccessor {
  categories = [
    { name: '政治' },
    { name: '经济' },
    { name: '科技' },
    { name: '体育' }
  ];

  selectedValue: string = '';
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // 实现禁用状态
  }
} 