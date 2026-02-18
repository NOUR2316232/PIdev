import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HospitalizationService } from '../services/hospitalization.service';

@Component({
  selector: 'app-hospitalization',
  standalone: false,
  templateUrl: './hospitalization.component.html',
  styleUrls: ['./hospitalization.component.css']
})
export class HospitalizationComponent implements OnInit {

  hospitalizations: any[] = [];
  filteredHospitalizations: any[] = [];
  form: FormGroup;
  editingId: number | null = null;
  searchTerm: string = '';

  constructor(
    private service: HospitalizationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef   // ← ADDED
  ) {
    this.form = this.fb.group({
      admissionDate: [''],
      dischargeDate: [''],
      roomNumber: [''],
      admissionReason: [''],
      status: [''],
      userId: [''],
      attendingDoctorId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        console.log("Backend data:", data);
        this.hospitalizations = data || [];
        this.filterHospitalizations();
        this.cdr.detectChanges();    // ← ADDED
      },
      error: err => console.error('Error loading hospitalizations', err)
    });
  }

  save() {
    const hospitalization = {
      ...this.form.value,
      admissionDate: this.form.value.admissionDate
        ? this.form.value.admissionDate + ':00'
        : null,
      dischargeDate: this.form.value.dischargeDate
        ? this.form.value.dischargeDate + ':00'
        : null
    };

    if (this.editingId) {
      this.service.update(this.editingId, hospitalization).subscribe({
        next: () => { this.loadAll(); this.cancel(); },
        error: err => console.error(err)
      });
    } else {
      this.service.create(hospitalization).subscribe({
        next: () => { this.loadAll(); this.cancel(); },
        error: err => console.error(err)
      });
    }
  }

  edit(h: any) {
    this.editingId = h.id;
    this.form.patchValue({
      ...h,
      admissionDate: this.formatDateForInput(h.admissionDate),
      dischargeDate: this.formatDateForInput(h.dischargeDate)
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.service.delete(id).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Error deleting hospitalization', err)
    });
  }

  cancel() {
    this.editingId = null;
    this.form.reset();
  }

  filterHospitalizations() {
    const term = this.searchTerm?.toLowerCase() || '';
    this.filteredHospitalizations = this.hospitalizations.filter(h =>
      !term ||
      (h.roomNumber || '').toLowerCase().includes(term) ||
      (h.admissionReason || '').toLowerCase().includes(term) ||
      (h.status || '').toLowerCase().includes(term) ||
      String(h.userId || '').toLowerCase().includes(term) ||
      String(h.attendingDoctorId || '').toLowerCase().includes(term)
    );
  }

  private formatDateForInput(date: string | null): string | null {
    if (!date) return null;
    return date.substring(0, 16);
  }
}