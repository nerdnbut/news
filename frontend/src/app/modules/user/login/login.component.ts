import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>登录</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>用户名</mat-label>
              <input matInput formControlName="username" placeholder="请输入用户名">
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                用户名必填
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>密码</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" placeholder="请输入密码">
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                密码必填
              </mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/register">
                注册账号
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loginForm.invalid || loading">
                {{loading ? '登录中...' : '登录'}}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;

      mat-card {
        width: 100%;
        max-width: 400px;
        margin: 20px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 0;
      }

      .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open('登录成功', '关闭', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.error || '登录失败', '关闭', { duration: 3000 });
        }
      });
    }
  }
}