import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Consultation {
  id?: number;
  patientId: number | null;
  doctorId: number | null;
  consultationDate: string;
  diagnosis: string;
  treatmentPlan: string;
  followUpDate: string | null;
  status: string;
  medicalHistoryId?: number;
}

export interface MedicalHistory {
  id?: number;
  userId: number;
  diagnosis?: string;
  allergies?: string;
  chronicConditions?: string;
  familyHistory?: string;
  notes?: string;
}

export type TriageLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TriageAssessmentRequest {
  patientId: number;
  arrivalTime: string;
  heartRate?: number | null;
  systolicBp?: number | null;
  spo2?: number | null;
  painScore?: number | null;
  age?: number | null;
  severeComorbidity?: boolean | null;
  respiratoryDistress?: boolean | null;
}

export interface TriageAssessmentResponse {
  assessmentId: number;
  queueItemId: number;
  patientId: number;
  score: number;
  triageLevel: TriageLevel;
  recommendedMaxWaitMinutes: number;
  deadlineAt: string;
  queueStatus: QueueStatus;
}

export interface TriageQueueItem {
  queueItemId: number;
  assessmentId: number;
  patientId: number;
  score: number;
  triageLevel: TriageLevel;
  maxWaitMinutes: number;
  arrivalTime: string;
  deadlineAt: string;
  status: QueueStatus;
  assignedDoctorId?: number | null;
  lastEscalationType?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | null;
  lastEscalationAt?: string | null;
  manualOverride: boolean;
  overrideReason?: string | null;
}

export interface TriageQueueAction {
  doctorId: number;
}

export interface TriageOverride {
  triageLevel: TriageLevel;
  maxWaitMinutes?: number | null;
  overrideReason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalService {
  private consulationBaseUrl = 'http://localhost:8079/api/consultations';
  private medicalHistoryBaseUrl = 'http://localhost:8079/api/medical-histories';
  private triageBaseUrl = 'http://localhost:8079/api/triage';

  constructor(private http: HttpClient) {}

  // ==================== CONSULTATION METHODS ====================
  
  getAllConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.consulationBaseUrl).pipe(
      catchError((error) => this.handleError('getAllConsultations', error))
    );
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.consulationBaseUrl}/${id}`).pipe(
      catchError((error) => this.handleError('getConsultationById', error))
    );
  }

  getConsultationsByPatientId(patientId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.consulationBaseUrl}/patient/${patientId}`).pipe(
      catchError((error) => this.handleError('getConsultationsByPatientId', error))
    );
  }

  getConsultationsByDoctorId(doctorId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.consulationBaseUrl}/doctor/${doctorId}`).pipe(
      catchError((error) => this.handleError('getConsultationsByDoctorId', error))
    );
  }

  createConsultation(consultation: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(this.consulationBaseUrl, consultation).pipe(
      catchError((error) => this.handleError('createConsultation', error))
    );
  }

  updateConsultation(id: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.consulationBaseUrl}/${id}`, consultation).pipe(
      catchError((error) => this.handleError('updateConsultation', error))
    );
  }

  deleteConsultation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.consulationBaseUrl}/${id}`).pipe(
      catchError((error) => this.handleError('deleteConsultation', error))
    );
  }

  // ==================== MEDICAL HISTORY METHODS ====================

  getAllMedicalHistories(): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(this.medicalHistoryBaseUrl).pipe(
      catchError((error) => this.handleError('getAllMedicalHistories', error))
    );
  }

  getMedicalHistoryById(id: number): Observable<MedicalHistory> {
    return this.http.get<MedicalHistory>(`${this.medicalHistoryBaseUrl}/${id}`).pipe(
      catchError((error) => this.handleError('getMedicalHistoryById', error))
    );
  }

  getMedicalHistoryByUserId(userId: number): Observable<MedicalHistory> {
    return this.http.get<MedicalHistory>(`${this.medicalHistoryBaseUrl}/user/${userId}`).pipe(
      catchError((error) => this.handleError('getMedicalHistoryByUserId', error))
    );
  }

  createMedicalHistory(medicalHistory: MedicalHistory): Observable<MedicalHistory> {
    return this.http.post<MedicalHistory>(this.medicalHistoryBaseUrl, medicalHistory).pipe(
      catchError((error) => this.handleError('createMedicalHistory', error))
    );
  }

  updateMedicalHistory(id: number, medicalHistory: MedicalHistory): Observable<MedicalHistory> {
    return this.http.put<MedicalHistory>(`${this.medicalHistoryBaseUrl}/${id}`, medicalHistory).pipe(
      catchError((error) => this.handleError('updateMedicalHistory', error))
    );
  }

  deleteMedicalHistory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.medicalHistoryBaseUrl}/${id}`).pipe(
      catchError((error) => this.handleError('deleteMedicalHistory', error))
    );
  }

  // ==================== TRIAGE METHODS ====================

  createTriageAssessment(payload: TriageAssessmentRequest): Observable<TriageAssessmentResponse> {
    return this.http.post<TriageAssessmentResponse>(`${this.triageBaseUrl}/assessments`, payload).pipe(
      catchError((error) => this.handleError('createTriageAssessment', error))
    );
  }

  getTriageQueue(): Observable<TriageQueueItem[]> {
    return this.http.get<TriageQueueItem[]>(`${this.triageBaseUrl}/queue`).pipe(
      catchError((error) => this.handleError('getTriageQueue', error))
    );
  }

  startCare(queueItemId: number, payload: TriageQueueAction): Observable<TriageQueueItem> {
    return this.http.post<TriageQueueItem>(`${this.triageBaseUrl}/queue/${queueItemId}/start-care`, payload).pipe(
      catchError((error) => this.handleError('startCare', error))
    );
  }

  closeQueueItem(queueItemId: number): Observable<TriageQueueItem> {
    return this.http.post<TriageQueueItem>(`${this.triageBaseUrl}/queue/${queueItemId}/close`, {}).pipe(
      catchError((error) => this.handleError('closeQueueItem', error))
    );
  }

  overrideQueueItem(queueItemId: number, payload: TriageOverride): Observable<TriageQueueItem> {
    return this.http.post<TriageQueueItem>(`${this.triageBaseUrl}/queue/${queueItemId}/override`, payload).pipe(
      catchError((error) => this.handleError('overrideQueueItem', error))
    );
  }

  // ==================== ERROR HANDLING ====================

  private handleError(operation = 'operation', error: HttpErrorResponse) {
    let errorMessage = `Error in ${operation}: `;
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage += error.error.message;
    } else {
      // Server-side error
      errorMessage += `Status ${error.status}: ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        errorMessage += ` - ${JSON.stringify(error.error)}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
