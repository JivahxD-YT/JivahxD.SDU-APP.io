import { Component, inject } from '@angular/core';
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
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
    <footer>
      <strong>Universidad Simón Bolívar</strong>
      <span>Canal confidencial para fortalecer una comunidad universitaria segura y transparente.</span>
    </footer>
  `
})
/** Componente raíz: presenta navegación global y mantiene visible el estado de sesión. */
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
