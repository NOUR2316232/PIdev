// src/app/services/diagnostic.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {
  private backendUrl = 'http://localhost:8070/diagnostic/diagnostic-orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.backendUrl);
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/${id}`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(this.backendUrl, order);
  }

  updateOrder(id: string, order: any): Observable<any> {
    return this.http.put<any>(`${this.backendUrl}/${id}`, order);
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.backendUrl}/${id}`);
  }
}
