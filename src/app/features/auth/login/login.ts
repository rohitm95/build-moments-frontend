import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private location = inject(Location);

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

  onSubmit() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }
    this.isLoading.set(true);
    // TODO: connect to auth service
    setTimeout(() => this.isLoading.set(false), 1200);
  }
}
