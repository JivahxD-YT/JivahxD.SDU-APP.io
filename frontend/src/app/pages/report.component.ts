import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ComplaintApiService } from '../core/complaint-api.service';
import { Campus, REPORTER_ROLES, ReporterRole } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="form-page">
      <a class="back-link" routerLink="/">← Volver al inicio</a>
      <div class="section-heading">
        <p class="eyebrow">CANAL CONFIDENCIAL</p>
        <h1>Presentar una denuncia</h1>
        <p>Comparte la información necesaria para que el equipo responsable pueda revisar el caso.</p>
      </div>
      @if (success()) {
        <div class="alert alert-success" role="status">
          <strong>Denuncia registrada.</strong> Tu reporte se recibió correctamente.
          @if (telegramUsername.trim()) { Si tu usuario de Telegram está vinculado al bot, recibirás las actualizaciones de estado. }
          @else { Puedes presentar otra denuncia e indicar tu usuario de Telegram para recibir actualizaciones. }
        </div>
        <a class="button button-primary" routerLink="/">Regresar al inicio</a>
      } @else {
        @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }
        @if (campusError()) { <div class="alert alert-error" role="alert">{{ campusError() }}</div> }
        <form class="form-card" (ngSubmit)="submit()" #reportForm="ngForm">
          <label>
            Rol en la universidad <span class="required">*</span>
            <select name="reporterRole" [(ngModel)]="reporterRole" required>
              <option value="" disabled>Selecciona tu rol</option>
              @for (role of roles; track role) { <option [value]="role">{{ role }}</option> }
            </select>
          </label>
          <label>
            Sede donde ocurrió el evento <span class="required">*</span>
            <select name="campusId" [(ngModel)]="campusId" required>
              <option [ngValue]="null" disabled>Selecciona una sede</option>
              @for (campus of campuses(); track campus.id) { <option [ngValue]="campus.id">{{ campus.name }}</option> }
            </select>
          </label>
          <label>
            Fecha del evento <span class="required">*</span>
            <input name="eventDate" type="date" [(ngModel)]="eventDate" [max]="today" required>
          </label>
          <label>
            Descripción de lo ocurrido <span class="required">*</span>
            <textarea name="description" [(ngModel)]="description" rows="6" maxlength="500" required placeholder="Describe los hechos de la forma más clara posible."></textarea>
            <small class="field-hint">{{ description.length }}/500 caracteres</small>
          </label>
          <label>
            Usuario de Telegram <span class="optional">(opcional)</span>
            <input name="telegramUsername" [(ngModel)]="telegramUsername" maxlength="100" placeholder="@usuario">
            <small class="field-hint">Primero envía /start al <a href="https://t.me/denuncia_requestUSB_bot" target="_blank" rel="noopener noreferrer">&#64;denuncia_requestUSB_bot</a> para habilitar notificaciones.</small>
          </label>
          <div class="form-actions">
            <button class="button button-primary" type="submit" [disabled]="reportForm.invalid || submitting() || campuses().length === 0">
              {{ submitting() ? 'Enviando…' : 'Enviar denuncia' }}
            </button>
          </div>
        </form>
      }
    </section>
  `
})
export class ReportComponent implements OnInit {
  private readonly api = inject(ComplaintApiService);
  readonly roles = REPORTER_ROLES;
  readonly today = this.localDateToday();
  readonly campuses = signal<Campus[]>([]);
  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly campusError = signal('');
  reporterRole: ReporterRole | '' = '';
  campusId: number | null = null;
  eventDate = this.today;
  description = '';
  telegramUsername = '';

  private localDateToday(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.api.getCampuses().subscribe({
      next: (campuses) => this.campuses.set(campuses),
      error: () => this.campusError.set('No se pudieron cargar las sedes. Actualiza la página para intentarlo nuevamente.')
    });
  }

  submit(): void {
    if (!this.reporterRole || this.campusId === null || !this.description.trim()) return;
    this.submitting.set(true);
    this.error.set('');
    this.api.createComplaint({
      campusId: this.campusId,
      reporterRole: this.reporterRole,
      eventDate: this.eventDate,
      description: this.description.trim(),
      telegramUsername: this.telegramUsername.trim() || null
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.detail ?? 'No se pudo registrar la denuncia. Intenta nuevamente.');
        this.submitting.set(false);
      }
    });
  }
}
