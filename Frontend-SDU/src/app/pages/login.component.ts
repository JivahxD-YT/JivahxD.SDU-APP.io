import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="login-page">
      <a class="back-link" routerLink="/">← Volver al inicio</a>
      <div class="login-card">
        <p class="eyebrow">ACCESO RESTRINGIDO</p>
        <h1>Panel administrativo</h1>
        <p>Inicia sesión con las credenciales de administrador.</p>
        @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <label>Usuario
            <input name="username" [(ngModel)]="username" autocomplete="username" required>
          </label>
          <label>Contraseña
            <input name="password" [(ngModel)]="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="button button-primary button-wide" type="submit" [disabled]="loginForm.invalid || submitting()">
            {{ submitting() ? 'Validando…' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  readonly error = signal('');
  readonly submitting = signal(false);

  login(): void {
    this.submitting.set(true);
    this.error.set('');
    this.auth.login(this.username, this.password).subscribe({
      next: () => void this.router.navigateByUrl('/admin'),
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'No se pudo contactar al servidor. Intenta nuevamente.');
        this.submitting.set(false);
      }
    });
  }
}
