import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth as AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private location = inject(Location);
  private router = inject(Router);
  private authService = inject(AuthService);

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
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Login failed. Please check your credentials.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
