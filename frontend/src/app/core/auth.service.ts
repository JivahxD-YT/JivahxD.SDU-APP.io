import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { clearAuthorization, createAuthorizationHeader, setAuthorization } from './auth-state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly authenticated = signal(false);

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    const authorization = createAuthorizationHeader(username, password);
    return this.http.get<void>('/api/admin/auth/check', {
      headers: new HttpHeaders({ Authorization: authorization })
    }).pipe(
      tap(() => {
        setAuthorization(username, password);
        this.authenticated.set(true);
      })
    );
  }

  check(): Observable<boolean> {
    return this.http.get<void>('/api/admin/auth/check').pipe(
      map(() => {
        this.authenticated.set(true);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.logout();
        return error.status === 401 || error.status === 403
          ? of(false)
          : throwError(() => error);
      })
    );
  }

  logout(): void {
    clearAuthorization();
    this.authenticated.set(false);
  }
}
