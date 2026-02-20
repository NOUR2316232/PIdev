import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { HospitalizationService } from '../../../services/hospitalization.service';
import { KeycloakAdminService, KeycloakUser } from '../../../services/keycloak-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

// ── Custom validator: dischargeDate must be after admissionDate ──
function dischargeDateValidator(group: AbstractControl): ValidationErrors | null {
  const admission = group.get('admissionDate')?.value;
  const discharge = group.get('dischargeDate')?.value;
  if (admission && discharge && new Date(discharge) <= new Date(admission)) {
    return { dischargeDateBeforeAdmission: true };
  }
  return null;
}

// ── Custom validator: blood pressure format "120/80" ──
function bloodPressureValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) return null;
  return /^\d{2,3}\/\d{2,3}$/.test(val) ? null : { bloodPressureFormat: true };
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
  todayIso = new Date().toISOString().slice(0, 16);

  // ── Keycloak current user (doctor) ───────────────────────
  currentUserId:   string = '';
  currentUserName: string = '';
  currentUserRole: string = '';

  get isDoctor():  boolean { return this.currentUserRole === 'doctor'; }
  get isPatient(): boolean { return this.currentUserRole === 'patient'; }

  // ── Patients loaded from Keycloak Admin API ───────────────
  patientUsers: KeycloakUser[]   = [];
  patientsLoading                = false;

  // ── Patient search / dropdown state ──────────────────────
  patientSearch     = '';
  dropdownOpen      = false;
  selectedPatient: KeycloakUser | null = null;

  get filteredPatients(): KeycloakUser[] {
    const term = this.patientSearch.toLowerCase().trim();
    if (!term) return this.patientUsers;
    return this.patientUsers.filter(u =>
      KeycloakAdminService.displayName(u).toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term)
    );
  }

  private readonly IGNORED_ROLES = [
    'offline_access', 'uma_authorization', 'default-roles-nephro-realm'
  ];

  constructor(
    private service: HospitalizationService,
    private adminService: KeycloakAdminService,
    private fb: FormBuilder,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loadKeycloakUser();
    this.initForm();
    this.loadAll();
    this.loadPatients();
  }

  // ══════════════════════════════════════════════
  //  KEYCLOAK — current user (the logged-in doctor)
  // ══════════════════════════════════════════════
  private loadKeycloakUser(): void {
    const token: any = this.keycloakService.getKeycloakInstance().tokenParsed;
    if (!token) return;

    this.currentUserId   = token['sub'] || '';
    this.currentUserName = this.buildName(token);

    const roles: string[] = this.keycloakService.getUserRoles() || [];
    const primary = roles.find(r => !this.IGNORED_ROLES.includes(r)) || '';
    this.currentUserRole = primary.toLowerCase();
  }

  private buildName(token: any): string {
    const first = token['given_name']  || '';
    const last  = token['family_name'] || '';
    const full  = `${first} ${last}`.trim();
    return full || token['preferred_username'] || 'Unknown';
  }

  // ══════════════════════════════════════════════
  //  KEYCLOAK ADMIN — load patients list
  // ══════════════════════════════════════════════
  loadPatients(): void {
    this.patientsLoading = true;
    this.adminService.getUsersByRole('patient').subscribe({
      next: users => {
        this.patientUsers = users;
        this.patientsLoading = false;
      },
      error: () => { this.patientsLoading = false; }
    });
  }

  // ── Patient dropdown interactions ─────────────
  openDropdown(): void {
    this.dropdownOpen  = true;
    this.patientSearch = '';
  }

  selectPatient(user: KeycloakUser): void {
    this.selectedPatient = user;
    this.form.get('userId')?.setValue(user.id);
    this.dropdownOpen  = false;
    this.patientSearch = '';
  }

  clearPatient(): void {
    this.selectedPatient = null;
    this.form.get('userId')?.setValue('');
  }

  patientDisplayName(user: KeycloakUser): string {
    return KeycloakAdminService.displayName(user);
  }

  getInitials(user: KeycloakUser | null): string {
    if (!user) return '?';
    const name = KeycloakAdminService.displayName(user);
    return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  // ══════════════════════════════════════════════
  //  FORM INIT
  // ══════════════════════════════════════════════
  private initForm(): void {
    this.form = this.fb.group(
      {
        admissionDate:     ['', Validators.required],
        dischargeDate:     [''],
        roomNumber:        ['', [Validators.required, Validators.maxLength(20)]],
        admissionReason:   ['', [Validators.required, Validators.maxLength(255)]],
        status:            ['', Validators.required],
        userId:            ['', Validators.required],              // filled by patient dropdown
        attendingDoctorId: [{ value: this.currentUserId, disabled: false }, Validators.required], // auto-filled with doctor's Keycloak ID
        vitalSignsRecords: this.fb.array([])
      },
      { validators: dischargeDateValidator }
    );
  }

  // ══════════════════════════════════════════════
  //  VITAL SIGNS FORMARRAY
  // ══════════════════════════════════════════════
  get vitalSigns(): FormArray {
    return this.form.get('vitalSignsRecords') as FormArray;
  }

  createVitalSignGroup(vs?: any): FormGroup {
    return this.fb.group({
      recordDate:       [vs?.recordDate       || '', Validators.required],
      temperature:      [vs?.temperature      || '', [Validators.required, Validators.min(30), Validators.max(45)]],
      bloodPressure:    [vs?.bloodPressure    || '', [Validators.required, bloodPressureValidator]],
      heartRate:        [vs?.heartRate        || '', [Validators.required, Validators.min(20), Validators.max(300)]],
      respiratoryRate:  [vs?.respiratoryRate  || '', [Validators.required, Validators.min(1),  Validators.max(100)]],
      oxygenSaturation: [vs?.oxygenSaturation || '', [Validators.required, Validators.min(0),  Validators.max(100)]],
      notes:            [vs?.notes            || '', Validators.maxLength(255)],
      recordedBy:       [vs?.recordedBy       || this.currentUserName]
    });
  }

  addVitalSign(vs?: any): void  { this.vitalSigns.push(this.createVitalSignGroup(vs)); }
  removeVitalSign(i: number): void { this.vitalSigns.removeAt(i); }

  vsField(i: number, field: string): AbstractControl | null {
    return this.vitalSigns.at(i).get(field);
  }
  vsHasError(i: number, field: string, error: string): boolean {
    const ctrl = this.vsField(i, field);
    return !!(ctrl?.hasError(error) && (ctrl.dirty || ctrl.touched));
  }

  // ══════════════════════════════════════════════
  //  CRUD
  // ══════════════════════════════════════════════
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();   // includes disabled attendingDoctorId
    const payload = {
      ...raw,
      admissionDate: raw.admissionDate ? raw.admissionDate + ':00' : null,
      dischargeDate: raw.dischargeDate ? raw.dischargeDate + ':00' : null
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

    // Restore selected patient from the list
    this.selectedPatient = this.patientUsers.find(u => u.id === h.userId) || null;

    this.form.patchValue({
      ...h,
      admissionDate:     this.formatDateForInput(h.admissionDate),
      dischargeDate:     this.formatDateForInput(h.dischargeDate),
      status:            h.status?.toLowerCase(),
      attendingDoctorId: this.currentUserId   // always the logged-in doctor
    });

    this.vitalSigns.clear();
    (h.vitalSignsRecords || []).forEach((vs: any) => this.addVitalSign(vs));
  }

  delete(id?: number): void {
    if (!id || !confirm('Delete this hospitalization record?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Error deleting hospitalization', err)
    });
  }

  cancel(): void {
    this.editingId       = null;
    this.selectedPatient = null;
    this.form.reset();
    // Re-apply doctor ID after reset
    this.form.get('attendingDoctorId')?.setValue(this.currentUserId);
    this.vitalSigns.clear();
  }

  filterHospitalizations(): void {
    const term = this.searchTerm?.toLowerCase() || '';
    this.filteredHospitalizations = this.hospitalizations.filter(h =>
      !term ||
      (h.roomNumber      || '').toLowerCase().includes(term) ||
      (h.admissionReason || '').toLowerCase().includes(term) ||
      (h.status          || '').toLowerCase().includes(term) ||
      String(h.userId            || '').toLowerCase().includes(term) ||
      String(h.attendingDoctorId || '').includes(term)
    );
  }

  // ── Table display helpers ─────────────────────
  getPatientDisplayName(userId: string): string {
    const found = this.patientUsers.find(u => u.id === userId);
    return found ? KeycloakAdminService.displayName(found) : `User #${userId}`;
  }

  getPatientInitials(userId: string): string {
    const found = this.patientUsers.find(u => u.id === userId);
    return this.getInitials(found || null);
  }

  private formatDateForInput(date: string | null): string | null {
    return date ? date.substring(0, 16) : null;
  }

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