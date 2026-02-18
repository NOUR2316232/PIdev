import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { HospitalizationService } from '../../../services/hospitalization.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// ── Custom validator: dischargeDate must be after admissionDate ──
function dischargeDateValidator(group: AbstractControl): ValidationErrors | null {
  const admission  = group.get('admissionDate')?.value;
  const discharge  = group.get('dischargeDate')?.value;
  if (admission && discharge && new Date(discharge) <= new Date(admission)) {
    return { dischargeDateBeforeAdmission: true };
  }
  return null;
}

// ── Custom validator: blood pressure format "120/80" ──
function bloodPressureValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) return null;
  const pattern = /^\d{2,3}\/\d{2,3}$/;
  return pattern.test(val) ? null : { bloodPressureFormat: true };
}

@Component({
  selector: 'app-hospitalization',
  templateUrl: './hospitalization.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./hospitalization.component.css']
})
export class HospitalizationComponent implements OnInit {

  hospitalizations: any[]         = [];
  filteredHospitalizations: any[] = [];
  form!: FormGroup;
  editingId: number | null        = null;
  searchTerm: string              = '';

  // ── expose today's date for max-date binding ──
  todayIso = new Date().toISOString().slice(0, 16);

  constructor(
    private service: HospitalizationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  // ════════════════════════════════════════════════
  //  FORM INIT
  // ════════════════════════════════════════════════
  private initForm(): void {
    this.form = this.fb.group(
      {
        admissionDate:     ['', Validators.required],
        dischargeDate:     [''],
        roomNumber:        ['', [Validators.required, Validators.maxLength(20)]],
        admissionReason:   ['', [Validators.required, Validators.maxLength(255)]],
        status:            ['', Validators.required],
        userId:            ['', [Validators.required, Validators.min(1)]],
        attendingDoctorId: ['', [Validators.required, Validators.min(1)]],
        vitalSignsRecords: this.fb.array([])
      },
      { validators: dischargeDateValidator }   // <-- cross-field validator
    );
  }

  // ════════════════════════════════════════════════
  //  FORMARRAY — VITAL SIGNS
  // ════════════════════════════════════════════════
  get vitalSigns(): FormArray {
    return this.form.get('vitalSignsRecords') as FormArray;
  }

  createVitalSignGroup(vs?: any): FormGroup {
    return this.fb.group({
      recordDate:       [vs?.recordDate        || '', Validators.required],
      temperature:      [vs?.temperature       || '', [
        Validators.required,
        Validators.min(30),       // clinical minimum
        Validators.max(45)        // clinical maximum
      ]],
      bloodPressure:    [vs?.bloodPressure     || '', [
        Validators.required,
        bloodPressureValidator    // "120/80" format
      ]],
      heartRate:        [vs?.heartRate         || '', [
        Validators.required,
        Validators.min(20),
        Validators.max(300)
      ]],
      respiratoryRate:  [vs?.respiratoryRate   || '', [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]],
      oxygenSaturation: [vs?.oxygenSaturation  || '', [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]],
      notes:            [vs?.notes             || '', Validators.maxLength(255)],
      recordedBy:       [vs?.recordedBy        || '']
    });
  }

  addVitalSign(vs?: any): void {
    this.vitalSigns.push(this.createVitalSignGroup(vs));
  }

  removeVitalSign(index: number): void {
    this.vitalSigns.removeAt(index);
  }

  // ── helpers used in the template ──
  vsField(i: number, field: string): AbstractControl | null {
    return this.vitalSigns.at(i).get(field);
  }

  vsHasError(i: number, field: string, error: string): boolean {
    const ctrl = this.vsField(i, field);
    return !!(ctrl?.hasError(error) && (ctrl.dirty || ctrl.touched));
  }

  // ════════════════════════════════════════════════
  //  CRUD
  // ════════════════════════════════════════════════
  loadAll(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.hospitalizations = data || [];
        this.filterHospitalizations();
      },
      error: err => console.error('Error loading hospitalizations', err)
    });
  }

  save(): void {
    // Mark everything as touched so errors appear
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.value;
    const payload = {
      ...raw,
      admissionDate:  raw.admissionDate  ? raw.admissionDate  + ':00' : null,
      dischargeDate:  raw.dischargeDate  ? raw.dischargeDate  + ':00' : null
    };

    const obs = this.editingId
      ? this.service.update(this.editingId, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: () => { this.loadAll(); this.cancel(); },
      error: err => console.error(err)
    });
  }

  edit(h: any): void {
    this.editingId = h.id;
    this.form.patchValue({
      ...h,
      admissionDate: this.formatDateForInput(h.admissionDate),
      dischargeDate: this.formatDateForInput(h.dischargeDate),
      status:        h.status?.toLowerCase()
    });
    this.vitalSigns.clear();
    (h.vitalSignsRecords || []).forEach((vs: any) => this.addVitalSign(vs));
  }

  delete(id?: number): void {
    if (!id) return;
    if (!confirm('Delete this hospitalization record?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Error deleting hospitalization', err)
    });
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset();
    this.vitalSigns.clear();
  }

  filterHospitalizations(): void {
    const term = this.searchTerm?.toLowerCase() || '';
    this.filteredHospitalizations = this.hospitalizations.filter(h =>
      !term ||
      (h.roomNumber        || '').toLowerCase().includes(term) ||
      (h.admissionReason   || '').toLowerCase().includes(term) ||
      (h.status            || '').toLowerCase().includes(term) ||
      String(h.userId            || '').includes(term) ||
      String(h.attendingDoctorId || '').includes(term)
    );
  }

  private formatDateForInput(date: string | null): string | null {
    if (!date) return null;
    return date.substring(0, 16);
  }

  // ── handy getters for template ──
  get f() { return this.form.controls; }

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && (ctrl.dirty || ctrl.touched));
  }

  get crossFieldError(): boolean {
    return !!(
      this.form.hasError('dischargeDateBeforeAdmission') &&
      (this.form.get('dischargeDate')?.dirty || this.form.get('dischargeDate')?.touched)
    );
  }
}