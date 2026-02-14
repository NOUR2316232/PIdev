import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

interface DiagnosticOrder {
  id?: string;
  orderType: string;
  testName: string;
  orderDate: string;
  priority: string;
  status: string;
  clinicalNotes: string;
  user_id: string;
  consultationId: string;
  orderedBy: string;
}

@Component({
  selector: 'app-diagnostic',
  standalone: false,
  templateUrl: './diagnostic.component.html',
  styleUrls: ['./diagnostic.component.css']
})
export class DiagnosticComponent implements OnInit {

  backendUrl = 'http://localhost:8070/diagnostic/diagnostic-orders';
  orders: DiagnosticOrder[] = [];
  form: FormGroup;
  editingId: string | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      orderType: [''],
      testName: [''],
      orderDate: [''],
      priority: [''],
      status: [''],
      clinicalNotes: [''],
      user_id: [''],
      consultationId: [''],
      orderedBy: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  // GET all orders
  loadOrders() {
    this.http.get<DiagnosticOrder[]>(this.backendUrl).subscribe({
      next: data => this.orders = data,
      error: err => console.error('Error loading orders', err)
    });
  }

  // CREATE or UPDATE order
  saveOrder() {
    const order: DiagnosticOrder = this.form.value;

    if (this.editingId) {
      // Update
      this.http.put<DiagnosticOrder>(`${this.backendUrl}/${this.editingId}`, order).subscribe({
        next: () => {
          this.loadOrders();
          this.form.reset();
          this.editingId = null;
        },
        error: err => console.error('Error updating order', err)
      });
    } else {
      // Create
      this.http.post<DiagnosticOrder>(this.backendUrl, order).subscribe({
        next: () => {
          this.loadOrders();
          this.form.reset();
        },
        error: err => console.error('Error creating order', err)
      });
    }
  }

  // Edit order
  editOrder(order: DiagnosticOrder) {
    this.editingId = order.id || null;
    this.form.patchValue(order);
  }

  // DELETE order
  deleteOrder(id: string | undefined) {
    if (!id) return;
    this.http.delete(`${this.backendUrl}/${id}`).subscribe({
      next: () => this.loadOrders(),
      error: err => console.error('Error deleting order', err)
    });
  }

  // Cancel editing
  cancelEdit() {
    this.editingId = null;
    this.form.reset();
  }
}
