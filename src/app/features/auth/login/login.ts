import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth as AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.scss',
})
export class Login {
  readonly location = inject(Location);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  goBack() {
    this.location.back();
  }

  async onSubmit() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }
    this.isLoading.set(true);
    
    try {
      await this.authService.login(this.email(), this.password());
      this.router.navigate(['/moments']);
    } catch (error: unknown) {
      // Log the error for debugging/monitoring and show a user-friendly message
      // Use console.error so the exception is handled (not swallowed)
      console.error('Login error:', error);
      this.errorMessage.set('Login failed. Please check your credentials.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
