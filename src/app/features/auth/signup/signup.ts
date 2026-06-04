import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth as AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './signup.scss',
})
export class Signup {
  private location = inject(Location);
  private router = inject(Router);
  private authService = inject(AuthService);

  firstName = signal('');
  lastName = signal('');
  phone = signal('');
  countryCode = signal('+91');
  email = signal('');
  city = signal('');
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
    if (!this.firstName() || !this.lastName() || !this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }
    this.isLoading.set(true);
    
    try {
      await this.authService.signup(this.email(), this.password(), {
        firstName: this.firstName(),
        lastName: this.lastName(),
        phone: this.phone(),
        countryCode: this.countryCode(),
        city: this.city(),
        email: this.email()
      });
      this.router.navigate(['/moments']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Signup failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
