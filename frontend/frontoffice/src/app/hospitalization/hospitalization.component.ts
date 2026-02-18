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

  hospitalizations: any[]         = [];
  filteredHospitalizations: any[] = [];
  form: FormGroup;
  editingId: number | null         = null;
  searchTerm: string               = '';
  activeFilter: string             = 'all';   // 'all' | 'active' | 'pending' | 'discharged'
  sortField: string                = 'date-desc';
  criticalCount: number            = 0;

  constructor(
    private service: HospitalizationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      admissionDate:     [''],
      dischargeDate:     [''],
      roomNumber:        [''],
      admissionReason:   [''],
      status:            [''],
      userId:            [''],
      attendingDoctorId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  // ── Load ──────────────────────────────────────
  loadAll(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.hospitalizations = data || [];
        this.applyFilters();
        this.updateCriticalCount();
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading hospitalizations', err)
    });
  }

  // ── Filter + Sort (single entry point) ───────
  applyFilters(): void {
    let list = [...this.hospitalizations];

    // 1. Status filter
    if (this.activeFilter !== 'all') {
      list = list.filter(h => h.status === this.activeFilter);
    }

    // 2. Search
    const term = this.searchTerm?.toLowerCase().trim() || '';
    if (term) {
      list = list.filter(h =>
        (h.roomNumber      || '').toLowerCase().includes(term) ||
        (h.admissionReason || '').toLowerCase().includes(term) ||
        (h.status          || '').toLowerCase().includes(term) ||
        String(h.userId            || '').includes(term) ||
        String(h.attendingDoctorId || '').includes(term)
      );
    }

    // 3. Sort
    list = this.sortList(list);

    this.filteredHospitalizations = list;
  }

  private sortList(list: any[]): any[] {
    return list.sort((a, b) => {
      if (this.sortField === 'date-desc') {
        return new Date(b.admissionDate || 0).getTime() - new Date(a.admissionDate || 0).getTime();
      }
      if (this.sortField === 'date-asc') {
        return new Date(a.admissionDate || 0).getTime() - new Date(b.admissionDate || 0).getTime();
      }
      if (this.sortField === 'room') {
        return (a.roomNumber || '').localeCompare(b.roomNumber || '');
      }
      return 0;
    });
  }

  setFilter(status: string): void {
    this.activeFilter = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm  = '';
    this.activeFilter = 'all';
    this.sortField   = 'date-desc';
    this.applyFilters();
  }

  // ── Stats helpers ─────────────────────────────
  countByStatus(status: string): number {
    return this.hospitalizations.filter(h => h.status === status).length;
  }

  private updateCriticalCount(): void {
    this.criticalCount = this.hospitalizations
      .filter(h => this.hasCriticalVitals(h)).length;
  }

  // ── Vital signs helpers ───────────────────────
  hasCriticalVitals(h: any): boolean {
    if (!h.vitalSignsRecords?.length) return false;
    return h.vitalSignsRecords.some((vs: any) => this.isVsCritical(vs));
  }

  isVsCritical(vs: any): boolean {
    return (
      (vs.temperature     != null && (vs.temperature > 39 || vs.temperature < 35)) ||
      (vs.heartRate       != null && (vs.heartRate > 120   || vs.heartRate < 45))  ||
      (vs.oxygenSaturation!= null &&  vs.oxygenSaturation < 92)                   ||
      (vs.respiratoryRate != null && (vs.respiratoryRate > 25 || vs.respiratoryRate < 8))
    );
  }

  getAbnormalCount(h: any): number {
    if (!h.vitalSignsRecords?.length) return 0;
    return h.vitalSignsRecords.filter((vs: any) => this.isVsAbnormal(vs)).length;
  }

  private isVsAbnormal(vs: any): boolean {
    return (
      (vs.temperature      != null && (vs.temperature > 38 || vs.temperature < 36))    ||
      (vs.heartRate        != null && (vs.heartRate > 100   || vs.heartRate < 60))      ||
      (vs.oxygenSaturation != null &&  vs.oxygenSaturation < 95)                        ||
      (vs.respiratoryRate  != null && (vs.respiratoryRate > 20 || vs.respiratoryRate < 12))
    );
  }

  // ── Timeline helpers ──────────────────────────
  getStayDuration(h: any): string {
    if (!h.admissionDate) return '—';
    const start = new Date(h.admissionDate).getTime();
    const end   = h.dischargeDate ? new Date(h.dischargeDate).getTime() : Date.now();
    const days  = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (days === 0) return '< 1 day';
    return days === 1 ? '1 day' : `${days} days`;
  }

  getProgressPercent(h: any): number {
    if (!h.admissionDate) return 0;
    if (!h.dischargeDate) return 100;  // ongoing = full bar
    const start   = new Date(h.admissionDate).getTime();
    const end     = new Date(h.dischargeDate).getTime();
    const elapsed = Date.now() - start;
    const total   = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  getVsPosition(h: any, vs: any): number {
    if (!h.admissionDate || !vs.recordDate) return 0;
    const start   = new Date(h.admissionDate).getTime();
    const end     = h.dischargeDate ? new Date(h.dischargeDate).getTime() : Date.now();
    const vsTime  = new Date(vs.recordDate).getTime();
    const total   = end - start;
    if (total <= 0) return 0;
    return Math.min(95, Math.max(5, Math.round(((vsTime - start) / total) * 100)));
  }

  // ── Scroll to first critical card ────────────
  scrollToFirstCritical(): void {
    const first = this.filteredHospitalizations.find(h => this.hasCriticalVitals(h));
    if (!first) return;
    const el = document.getElementById('critical-' + first.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── CRUD (kept for compatibility) ────────────
  filterHospitalizations(): void { this.applyFilters(); }

  save(): void {
    const hospitalization = {
      ...this.form.value,
      admissionDate: this.form.value.admissionDate ? this.form.value.admissionDate + ':00' : null,
      dischargeDate: this.form.value.dischargeDate ? this.form.value.dischargeDate + ':00' : null
    };
    const obs = this.editingId
      ? this.service.update(this.editingId, hospitalization)
      : this.service.create(hospitalization);
    obs.subscribe({ next: () => { this.loadAll(); this.cancel(); }, error: e => console.error(e) });
  }

  edit(h: any): void {
    this.editingId = h.id;
    this.form.patchValue({
      ...h,
      admissionDate: this.formatDateForInput(h.admissionDate),
      dischargeDate: this.formatDateForInput(h.dischargeDate)
    });
  }

  delete(id?: number): void {
    if (!id || !confirm('Delete this record?')) return;
    this.service.delete(id).subscribe({ next: () => this.loadAll(), error: e => console.error(e) });
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset();
  }

  private formatDateForInput(date: string | null): string | null {
    return date ? date.substring(0, 16) : null;
  }
}