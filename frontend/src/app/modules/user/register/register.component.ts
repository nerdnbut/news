import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>注册</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>用户名</mat-label>
              <input matInput formControlName="username" placeholder="请输入用户名">
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
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
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                密码必填
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>确认密码</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" placeholder="请再次输入密码">
              <button mat-icon-button matSuffix type="button"
                      (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                请确认密码
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch')">
                两次输入的密码不一致
              </mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/login">
                返回登录
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="registerForm.invalid || loading">
                {{loading ? '注册中...' : '注册'}}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
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
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { username, password } = this.registerForm.value;
      this.authService.register({ username, password }).subscribe({
        next: () => {
          this.snackBar.open('注册成功', '关闭', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || '注册失败', '关闭', { duration: 3000 });
        }
      });
    }
  }
}