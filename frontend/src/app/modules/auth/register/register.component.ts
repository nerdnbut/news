submitForm() {
  if (this.registerForm.valid) {
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('注册成功', '关闭', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.error?.error || '注册失败，请稍后重试', 
          '关闭', 
          { duration: 3000 }
        );
      }
    });
  }
} 