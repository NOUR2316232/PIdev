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

@Injectable({
  providedIn: 'root'
})
export class ClinicalService {
  private consulationBaseUrl = 'http://localhost:8079/api/consultations';
  private medicalHistoryBaseUrl = 'http://localhost:8079/api/medical-histories';

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

  getAvailablePatientIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.consulationBaseUrl}/patient-ids`).pipe(
      catchError((error) => this.handleError('getAvailablePatientIds', error))
    );
  }

  getAvailableDoctorIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.consulationBaseUrl}/doctor-ids`).pipe(
      catchError((error) => this.handleError('getAvailableDoctorIds', error))
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
