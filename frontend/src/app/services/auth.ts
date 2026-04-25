import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators';
import { User } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api';
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('user_data');
    if (data && data !== "undefined" && data !== "null") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  login(userData: User): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/token/`, userData).pipe(
      tap(response => {
        if (response.access) {
          localStorage.setItem('auth_token', response.access);
            const userToSave = response.user || { 
            ...userData, 
            id: response.user_id 
          };
          localStorage.setItem('user_data', JSON.stringify(userToSave));
          this.currentUser.set(userToSave);
        }
      })
    );
  }

  register(userData: User): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/`, userData);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token') && !!this.currentUser();
  }
}