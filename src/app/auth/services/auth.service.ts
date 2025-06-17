import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginRequest, JwtResponse } from '../interfaces/auth.interfaces';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      `${environment.api_route}/auth/signin`,
      credentials
    );
  }

  logout(): void {
    localStorage.removeItem('auth-token');
  }

  saveToken(token: string): void {
    localStorage.setItem('auth-token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getUser(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (e) {
      console.error('Token inválido', e);
      return null;
    }
  }
}
