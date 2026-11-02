import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">SISTEMA DE DENUNCIAS UNIVERSITARIO</p>
        <h1>Tu voz contribuye a un campus mejor.</h1>
        <p class="lead">Un canal confidencial y accesible para reportar situaciones que requieren atención de la universidad.</p>
        <a class="button button-primary" routerLink="/denunciar">Presentar una denuncia <span aria-hidden="true">→</span></a>
        <a class="button button-secondary tracking-home-link" routerLink="/consultar">Consultar una denuncia</a>
      </div>
      <div class="hero-card">
        <span class="card-icon" aria-hidden="true">◎</span>
        <h2>Un proceso claro</h2>
        <p>La denuncia será revisada por el equipo responsable. Si compartes tu usuario de Telegram y has iniciado el bot, podrás recibir avisos de cambios en el estado.</p>
      </div>
    </section>
    <section class="values">
      <article class="value-card">
        <span class="value-number">01</span>
        <h2>Confidencialidad</h2>
        <p>Los detalles de la denuncia solo están disponibles para personal administrativo autorizado.</p>
      </article>
      <article class="value-card">
        <span class="value-number">02</span>
        <h2>Trazabilidad</h2>
        <p>Cada caso cuenta con un estado para dar seguimiento a su proceso de atención.</p>
      </article>
      <article class="value-card">
        <span class="value-number">03</span>
        <h2>Compromiso</h2>
        <p>Promovemos una comunidad universitaria más justa, segura y transparente.</p>
      </article>
    </section>
    <p class="privacy-note">Si existe un peligro inmediato, contacta directamente a los servicios de emergencia de tu campus.</p>
  `
})
export class HomeComponent {}
