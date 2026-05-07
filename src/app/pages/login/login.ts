import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  username: string = '';
  errorMessage: string = '';
  isRegistering: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.saveUser(response.user);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        // After registering, log them in automatically
        this.onLogin();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
  }
}