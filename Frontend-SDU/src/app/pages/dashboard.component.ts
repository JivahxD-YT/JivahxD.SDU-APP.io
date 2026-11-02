import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComplaintApiService } from '../core/complaint-api.service';
import {
  CampusSummary,
  COMPLAINT_STATUSES,
  Complaint,
  ComplaintStatus,
  Page
} from '../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <section class="dashboard">
      <div class="dashboard-heading">
        <div>
          <p class="eyebrow">GESTIÓN INTERNA</p>
          <h1>Panel de denuncias</h1>
          <p>Revisa los reportes recibidos y actualiza su estado.</p>
        </div>
        <button class="button button-secondary" type="button" (click)="refresh()">Actualizar datos</button>
      </div>
      @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }
      <section class="summary-grid" aria-label="Cantidad de denuncias por sede">
        @for (item of summaries(); track item.campusName) {
          <article class="summary-card">
            <span>{{ item.campusName }}</span>
            <strong>{{ item.count }}</strong>
            <div class="bar-track"><div class="bar-fill" [style.width.%]="barWidth(item.count)"></div></div>
          </article>
        } @empty {
          <article class="summary-card"><span>Sin datos disponibles</span><strong>—</strong></article>
        }
      </section>
      <section class="table-card">
        <div class="table-heading">
          <div><h2>Denuncias recibidas</h2><p>{{ totalElements() }} en total</p></div>
          <label class="search-field">Buscar
            <input type="search" [(ngModel)]="search" placeholder="Sede, descripción o estado">
          </label>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>ID / Fecha</th><th>Sede / Rol</th><th>Descripción</th><th>Telegram</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              @for (complaint of filteredComplaints(); track complaint.id) {
                <tr>
                  <td><strong>#{{ complaint.id }}</strong><small>{{ complaint.createdAt | date:'dd/MM/yyyy' }}</small></td>
                  <td>{{ complaint.campusName || 'Sin sede' }}<small>{{ complaint.reporterRole }}</small></td>
                  <td class="description-cell">{{ complaint.description }}</td>
                  <td>{{ complaint.telegramUsername || '—' }}</td>
                  <td>
                    <select [attr.aria-label]="'Estado de denuncia ' + complaint.id" [ngModel]="statusFor(complaint)" (ngModelChange)="setStatus(complaint.id, $event)">
                      @for (status of statuses; track status) {
                        <option [value]="status" [disabled]="!canTransition(complaint.status, status)">{{ status }}</option>
                      }
                    </select>
                    <textarea class="admin-message" [attr.aria-label]="'Mensaje personalizado para denuncia ' + complaint.id"
                      [ngModel]="messageFor(complaint)" (ngModelChange)="setMessage(complaint.id, $event)"
                      maxlength="1000" rows="3" placeholder="Mensaje opcional para Telegram"></textarea>
                  </td>
                  <td><button class="button button-small" type="button" (click)="saveStatus(complaint)" [disabled]="savingId() === complaint.id || !hasPendingChanges(complaint)">
                    {{ savingId() === complaint.id ? 'Guardando…' : 'Guardar' }}
                  </button></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="empty-state">No hay denuncias que coincidan con la búsqueda.</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button class="button button-secondary button-small" type="button" (click)="changePage(-1)" [disabled]="pageNumber() === 0 || loading()">Anterior</button>
          <span>Página {{ pageNumber() + 1 }} de {{ totalPages() || 1 }}</span>
          <button class="button button-secondary button-small" type="button" (click)="changePage(1)" [disabled]="pageNumber() + 1 >= totalPages() || loading()">Siguiente</button>
        </div>
      </section>
    </section>
  `
})
/** Vista administrativa para consultar, buscar, paginar y actualizar denuncias. */
export class DashboardComponent implements OnInit {
  private readonly api = inject(ComplaintApiService);
  readonly statuses = COMPLAINT_STATUSES;
  readonly complaints = signal<Complaint[]>([]);
  readonly summaries = signal<CampusSummary[]>([]);
  readonly pageNumber = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly savingId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly pendingStatuses = signal<Record<number, ComplaintStatus>>({});
  readonly pendingMessages = signal<Record<number, string>>({});
  search = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getComplaints(this.pageNumber()).subscribe({
      next: (page: Page<Complaint>) => {
        this.complaints.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las denuncias. Vuelve a iniciar sesión o intenta actualizar.');
        this.loading.set(false);
      }
    });
    this.api.getCampusSummary().subscribe({
      next: (summaries) => this.summaries.set(summaries),
      error: () => this.error.set('No se pudieron cargar las estadísticas de las sedes.')
    });
  }

  filteredComplaints(): Complaint[] {
    const term = this.search.trim().toLocaleLowerCase();
    if (!term) return this.complaints();
    return this.complaints().filter((complaint) =>
      `${complaint.id} ${complaint.campusName ?? ''} ${complaint.description} ${complaint.status} ${complaint.reporterRole}`
        .toLocaleLowerCase().includes(term)
    );
  }

  statusFor(complaint: Complaint): ComplaintStatus {
    return this.pendingStatuses()[complaint.id] ?? complaint.status;
  }

  setStatus(id: number, status: ComplaintStatus): void {
    this.pendingStatuses.update((pending) => ({ ...pending, [id]: status }));
  }

  canTransition(current: ComplaintStatus, target: ComplaintStatus): boolean {
    if (current === target) return true;
    if (current === 'RECHAZADA' || current === 'PROCESADA') return false;
    if (target === 'RECHAZADA') return true;
    const order: ComplaintStatus[] = ['REGISTRADA', 'ADMITIDA', 'PROCESANDO', 'PROCESADA'];
    return order.indexOf(target) > order.indexOf(current);
  }

  messageFor(complaint: Complaint): string {
    return this.pendingMessages()[complaint.id] ?? '';
  }

  setMessage(id: number, message: string): void {
    this.pendingMessages.update((pending) => ({ ...pending, [id]: message }));
  }

  hasPendingChanges(complaint: Complaint): boolean {
    return this.statusFor(complaint) !== complaint.status || Boolean(this.messageFor(complaint).trim());
  }

  saveStatus(complaint: Complaint): void {
    this.savingId.set(complaint.id);
    this.error.set('');
    this.api.updateStatus(complaint.id, {
      status: this.statusFor(complaint),
      customMessage: this.messageFor(complaint).trim()
    }).subscribe({
      next: (updated) => {
        this.complaints.update((items) => items.map((item) => item.id === updated.id ? updated : item));
        this.pendingStatuses.update((pending) => {
          const next = { ...pending };
          delete next[complaint.id];
          return next;
        });
        this.pendingMessages.update((pending) => {
          const next = { ...pending };
          delete next[complaint.id];
          return next;
        });
        this.savingId.set(null);
        this.refresh();
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.detail ?? 'No se pudo actualizar el estado.');
        this.savingId.set(null);
      }
    });
  }

  barWidth(count: number): number {
    const largest = Math.max(1, ...this.summaries().map((item) => item.count));
    return Math.max(4, Math.round((count / largest) * 100));
  }

  changePage(direction: -1 | 1): void {
    const nextPage = this.pageNumber() + direction;
    if (nextPage < 0 || nextPage >= this.totalPages()) return;
    this.pageNumber.set(nextPage);
    this.refresh();
  }
}
