import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// ... 其他导入

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    // ... 其他模块
  ],
  exports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    // ... 其他模块
  ],
  declarations: [
    // ... 你的组件
  ]
})
export class SharedModule { } 