import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
onSubmit() {
  if (this.forgotForm.valid) {
    const email = this.forgotForm.get('email')?.value as string;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.message = res.message;
        this.error = null;

        setTimeout(() => {
          this.router.navigate(['/auth/reset-password']);
        }, 1000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to send reset code.';
        this.message = null;
      },
    });
  }
}
}
