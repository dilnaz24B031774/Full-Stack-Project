import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  isLoginMode = true;
  loginData = {
    email: '',
    password: '',
    studentId: '' 
  };

  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService 
  ) {}

  onLogin() {
    const email = this.loginData.email.toLowerCase().trim();
    const studentId = this.loginData.studentId.trim();
    const password = this.loginData.password;
    if (!email || !password || !studentId) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    if (!email.endsWith('@kbtu.kz')) {
      this.errorMessage = 'Use your @kbtu.kz email only';
      return;
    }
    this.errorMessage = '';
    const userData: User = {
      email: email,
      username: email.split('@')[0],
      student_id: studentId,
      password: password,
    };
    if (this.isLoginMode) {
        this.authService.login(userData).subscribe({
          next: (response) => {
            console.log('Success login:', response);
            this.router.navigate(['/']); 
          },
          error: (err) => {
            this.errorMessage = 'Invalid credentials or server error';
          }
        });
    } else {
        this.authService.register(userData).subscribe({
          next: () => {
            this.isLoginMode = true;
            alert('Success! Now please login.');
          },
          error: () => {
            this.errorMessage = 'Registration failed';
          }
        });
    }
  }
}