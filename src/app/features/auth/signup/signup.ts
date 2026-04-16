import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private location = inject(Location);

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

  onSubmit() {
    this.errorMessage.set('');
    if (!this.firstName() || !this.lastName() || !this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }
    this.isLoading.set(true);
    // TODO: connect to auth service
    setTimeout(() => this.isLoading.set(false), 1200);
  }
}
