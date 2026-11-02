import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ComplaintApiService } from '../core/complaint-api.service';
import { TrackingComplaint } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="form-page">
      <a class="back-link" routerLink="/">← Volver al inicio</a>
      <div class="section-heading">
        <p class="eyebrow">CONSULTA PÚBLICA</p>
        <h1>Estado de tu denuncia</h1>
        <p>Ingresa el código alfanumérico entregado al registrar la denuncia.</p>
      </div>
      <form class="form-card tracking-form" (ngSubmit)="track()">
        <label>
          Código de seguimiento
          <input name="trackingCode" [(ngModel)]="trackingCode" maxlength="12"
            placeholder="Ej. AB12CD34EF" required autocomplete="off">
        </label>
        <button class="button button-primary" type="submit" [disabled]="loading() || !trackingCode.trim()">Consultar</button>
      </form>
      @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }
      @if (complaint(); as result) {
        <article class="tracking-card">
          <div>
            <span>DENUNCIA</span>
            <strong>{{ result.trackingCode }}</strong>
          </div>
          <div>
            <span>ESTADO ACTUAL</span>
            <strong class="status-badge">{{ result.status }}</strong>
          </div>
          <div><span>SEDE</span><strong>{{ result.campusName || 'No indicada' }}</strong></div>
          <div><span>FECHA DEL REPORTE</span><strong>{{ result.createdAt.slice(0, 10) }}</strong></div>
          @if (result.evidenceUrls) {
            <div class="tracking-evidence">
              <span>ARCHIVOS ADJUNTOS</span>
              @for (url of result.evidenceUrls.split('\n'); track url) {
                <a [href]="url.trim()" target="_blank" rel="noopener noreferrer">{{ url.trim() }}</a>
              }
            </div>
          }
        </article>
      }
    </section>
  `
})
export class TrackingComponent {
  private readonly api = inject(ComplaintApiService);
  readonly complaint = signal<TrackingComplaint | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  trackingCode = '';

  track(): void {
    if (!this.trackingCode.trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.complaint.set(null);
    this.api.trackComplaint(this.trackingCode).subscribe({
      next: (result) => {
        this.complaint.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se encontró ninguna denuncia con ese código. Verifica que esté escrito correctamente.');
        this.loading.set(false);
      }
    });
  }
}
