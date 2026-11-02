// Contratos compartidos con la API; los nombres coinciden con las respuestas JSON del backend.
export interface Campus {
  id: number;
  name: string;
}

export interface Complaint {
  id: number;
  trackingCode: string;
  campusId: number | null;
  campusName: string | null;
  telegramUsername: string | null;
  description: string;
  eventDate: string;
  createdAt: string;
  status: ComplaintStatus;
  reporterRole: ReporterRole;
  evidenceUrls: string | null;
}

export interface ComplaintRequest {
  campusId: number;
  telegramUsername: string | null;
  description: string;
  eventDate: string;
  reporterRole: ReporterRole;
  evidenceUrls: string | null;
}

export interface TrackingComplaint {
  trackingCode: string;
  campusName: string | null;
  createdAt: string;
  status: ComplaintStatus;
  evidenceUrls: string | null;
}

export interface StatusUpdateRequest {
  status: ComplaintStatus;
  customMessage: string;
}

export interface CampusSummary {
  campusName: string;
  count: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export type ComplaintStatus =
  | 'REGISTRADA'
  | 'ADMITIDA'
  | 'RECHAZADA'
  | 'PROCESANDO'
  | 'PROCESADA';

export type ReporterRole =
  | 'ESTUDIANTE'
  | 'EMPLEADO'
  | 'PROFESOR'
  | 'ADMINISTRATIVO'
  | 'EXTERNO'
  | 'EGRESADO';

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'REGISTRADA',
  'ADMITIDA',
  'RECHAZADA',
  'PROCESANDO',
  'PROCESADA'
];

export const REPORTER_ROLES: ReporterRole[] = [
  'ESTUDIANTE',
  'EMPLEADO',
  'PROFESOR',
  'ADMINISTRATIVO',
  'EXTERNO',
  'EGRESADO'
];
