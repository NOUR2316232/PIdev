// src/app/services/hospitalization.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hospitalization {
  id?: number;
  admissionDate: string;
  dischargeDate?: string;
  roomNumber: string;
  admissionReason: string;
  status: string;
  userId: string;
  attendingDoctorId: string;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalizationService {
  private backendUrl = 'http://localhost:8070/hospitalization/api/hospitalizations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Hospitalization[]> {
    return this.http.get<Hospitalization[]>(this.backendUrl);
  }

  getById(id: number): Observable<Hospitalization> {
    return this.http.get<Hospitalization>(`${this.backendUrl}/${id}`);
  }

  create(hospitalization: Hospitalization): Observable<Hospitalization> {
    return this.http.post<Hospitalization>(this.backendUrl, hospitalization);
  }

  update(id: number, hospitalization: Hospitalization): Observable<Hospitalization> {
    return this.http.put<Hospitalization>(`${this.backendUrl}/${id}`, hospitalization);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}
