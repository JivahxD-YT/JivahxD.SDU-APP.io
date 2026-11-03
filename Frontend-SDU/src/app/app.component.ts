import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'sdu-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="institution-bar">
      <a href="https://unisimon.edu.co/" target="_blank" rel="noopener noreferrer">Sitio institucional</a>
      <span>Barranquilla · Colombia</span>
    </div>
    <header class="site-header">
      <a class="brand" routerLink="/">
        <img class="brand-logo" src="/assets/unisimon-logo.png" alt="Universidad Simón Bolívar">
        <span>Sistema de Denuncias <small>UNIVERSITARIO</small></span>
      </a>
      <nav aria-label="Navegación principal">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/denunciar" routerLinkActive="active">Presentar denuncia</a>
        <a routerLink="/consultar" routerLinkActive="active">Consultar estado</a>
        @if (auth.authenticated()) {
          <a routerLink="/admin" routerLinkActive="active">Administración</a>
          <button class="nav-logout" type="button" (click)="logout()">Salir</button>
        } @else {
          <a routerLink="/admin/login" routerLinkActive="active">Acceso administrativo</a>
        }
        <button
          class="theme-toggle"
          type="button"
          (click)="toggleTheme()"
          [attr.aria-label]="darkMode() ? 'Activar modo claro' : 'Activar modo oscuro'"
          [attr.title]="darkMode() ? 'Modo claro' : 'Modo oscuro'">
          {{ darkMode() ? '☀' : '☾' }}
        </button>
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
    <footer>
      <strong>Universidad Simón Bolívar</strong>
      <span>Canal confidencial para fortalecer una comunidad universitaria segura y transparente.</span>
      <span>Desarrollado por <strong>Hugo Jimenez</strong></span>
      <span>Colaboradores: Breyner Callejas, Juan Gale, Daniel Herrera y Jhon Ortega</span>
    </footer>
  `
})
/** Componente raíz: presenta navegación global y mantiene visible el estado de sesión. */
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  readonly darkMode = signal(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.darkMode());
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }

  toggleTheme(): void {
    this.darkMode.update((enabled) => !enabled);
    this.applyTheme(this.darkMode());
  }

  private getInitialTheme(): boolean {
    try {
      const stored = localStorage.getItem('sdu-theme');
      if (stored) {
        return stored === 'dark';
      }
    } catch {
      // Storage can be unavailable in privacy-restricted contexts.
    }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;

    const themeColor = this.document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', dark ? '#171c18' : '#05803b');

    try {
      localStorage.setItem('sdu-theme', theme);
    } catch {
      // The theme still works for the current session without storage.
    }
  }
}
