import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Campus,
  CampusSummary,
  Complaint,
  ComplaintRequest,
  ComplaintStatus,
  Page,
  TrackingComplaint,
  StatusUpdateRequest
} from './models';

/** Punto central de comunicación entre Angular y los endpoints REST públicos y administrativos. */
@Injectable({ providedIn: 'root' })
export class ComplaintApiService {
  constructor(private readonly http: HttpClient) {}

  getCampuses(): Observable<Campus[]> {
    return this.http.get<Campus[]>('/api/public/campuses');
  }

  createComplaint(complaint: ComplaintRequest): Observable<Complaint> {
    return this.http.post<Complaint>('/api/public/complaints', complaint);
  }

  trackComplaint(trackingCode: string): Observable<TrackingComplaint> {
    return this.http.get<TrackingComplaint>(
      `/api/public/complaints/tracking/${encodeURIComponent(trackingCode.trim().toUpperCase())}`
    );
  }

  getComplaints(page = 0): Observable<Page<Complaint>> {
    return this.http.get<Page<Complaint>>('/api/admin/complaints', {
      params: { page, size: 50, sort: 'createdAt,desc' }
    });
  }

  getCampusSummary(): Observable<CampusSummary[]> {
    return this.http.get<CampusSummary[]>('/api/admin/stats/by-campus');
  }

  updateStatus(id: number, request: StatusUpdateRequest): Observable<Complaint> {
    return this.http.put<Complaint>(`/api/admin/complaints/${id}/status`, request);
  }
}
