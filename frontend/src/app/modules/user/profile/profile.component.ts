import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>个人资料</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>用户名</mat-label>
              <input matInput formControlName="username" placeholder="请输入新用户名">
              <mat-error *ngIf="profileForm.get('username')?.hasError('required')">
                用户名必填
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>新密码</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="newPassword" placeholder="请输入新密码">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>确认新密码</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" placeholder="请确认新密码">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="profileForm.hasError('passwordMismatch')">
                两次输入的密码不一致
              </mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="profileForm.invalid || loading">
                {{loading ? '保存中...' : '保存修改'}}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;

      mat-card {
        margin-top: 20px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 0;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      newPassword: [''],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // 获取当前用户信息
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileForm.patchValue({
        username: currentUser.username
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      const { username, newPassword } = this.profileForm.value;
      this.authService.updateProfile({ username, password: newPassword }).subscribe({
        next: () => {
          this.snackBar.open('个人资料更新成功', '关闭', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || '更新失败', '关闭', { duration: 3000 });
        }
      });
    }
  }
} 