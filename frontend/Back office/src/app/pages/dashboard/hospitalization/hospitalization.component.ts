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

  // ── Keycloak current user ────────────────────────────────────
  currentUserId:   string = '';
  currentUserName: string = '';
  currentUserRole: string = '';

  get isDoctor():  boolean { return this.currentUserRole === 'doctor'; }
  get isPatient(): boolean { return this.currentUserRole === 'patient'; }
  get isNurse():   boolean { return this.currentUserRole === 'nurse'; }
  get isAdmin():   boolean { return this.currentUserRole === 'admin'; }

  /** Nurses can only edit existing records — they cannot create new ones or delete */
  get canCreate(): boolean { return !this.isNurse; }
  get canDelete(): boolean { return !this.isNurse; }

  /** True when the form is open in a mode the current user is allowed to use */
  get formVisible(): boolean {
    // Nurses only see the form when they are actively editing a record
    if (this.isNurse) return this.editingId !== null;
    return true;
  }

  // ── Patients loaded from Keycloak Admin API ──────────────────
  patientUsers: KeycloakUser[]   = [];
  patientsLoading                = false;

  // ── Patient search / dropdown state ─────────────────────────
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

  /** Fields a nurse is NOT allowed to modify — locked on edit */
  private readonly NURSE_LOCKED_FIELDS = [
    'admissionDate', 'dischargeDate', 'roomNumber',
    'admissionReason', 'status', 'userId', 'attendingDoctorId'
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
  //  KEYCLOAK — current user (logged-in)
  // ══════════════════════════════════════════════
  private loadKeycloakUser(): void {
    const token: any = this.keycloakService.getKeycloakInstance().tokenParsed;
    if (!token) return;

    this.currentUserId   = token['sub'] || '';
    this.currentUserName = this.buildName(token);

    // Collect ALL roles: realm roles + every client's roles from the token directly
    const realmRoles: string[] = token['realm_access']?.roles || [];
    const clientAccess: any    = token['resource_access'] || {};
    const clientRoles: string[] = Object.values(clientAccess)
      .flatMap((c: any) => c?.roles || []);

    const allRoles = [...realmRoles, ...clientRoles].map((r: string) => r.toLowerCase());

    console.debug('[RoleDetect] All roles found:', allRoles); // remove after debugging

    // Priority order: first match wins
    const ROLE_PRIORITY = ['admin', 'doctor', 'nurse', 'patient'];
    this.currentUserRole = ROLE_PRIORITY.find(r => allRoles.includes(r)) || '';

    console.debug('[RoleDetect] Resolved role:', this.currentUserRole); // remove after debugging
  }

  private buildName(token: any): string {
    const first = token['given_name']  || '';
    const last  = token['family_name'] || '';
    const full  = `${first} ${last}`.trim();
    return full || token['preferred_username'] || 'Unknown';
  }

  // ── Fallback: patient names extracted from hospitalization records themselves
  private patientNameCache: Map<string, string> = new Map();

  // ══════════════════════════════════════════════
  //  KEYCLOAK ADMIN — load patients list
  // ══════════════════════════════════════════════
  loadPatients(): void {
    this.patientsLoading = true;
    this.adminService.getUsersByRole('patient').subscribe({
      next: users => {
        this.patientUsers    = users;
        this.patientsLoading = false;
        // Build cache from Keycloak users too
        users.forEach(u => this.patientNameCache.set(u.id, KeycloakAdminService.displayName(u)));
      },
      error: (err) => {
        this.patientsLoading = false;
        console.warn('[loadPatients] Could not load patient list (likely 403 for non-admin role):', err?.status, err?.message);
        // For nurses: fall back to names embedded in hospitalization records
        this.buildPatientCacheFromHospitalizations();
      }
    });
  }

  /**
   * When the Keycloak Admin API is inaccessible (e.g. nurse role),
   * extract whatever patient info the backend already returns in each
   * hospitalization record (patientFirstName / patientLastName / patientName / userName).
   */
  private buildPatientCacheFromHospitalizations(): void {
    this.hospitalizations.forEach(h => {
      if (!h.userId) return;
      // Try common field names your backend might return
      const name =
        (h.patientFirstName && h.patientLastName
          ? `${h.patientFirstName} ${h.patientLastName}`.trim()
          : null) ||
        h.patientName ||
        h.patientFullName ||
        h.userName ||
        null;
      if (name) this.patientNameCache.set(h.userId, name);
    });
  }

  // ── Patient dropdown interactions ─────────────
  openDropdown(): void {
    if (this.isNurse) return; // nurses cannot change patient assignment
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
    if (this.isNurse) return; // nurses cannot clear patient assignment
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
        userId:            ['', Validators.required],
        attendingDoctorId: [{ value: this.currentUserId, disabled: false }, Validators.required],
        vitalSignsRecords: this.fb.array([])
      },
      { validators: dischargeDateValidator }
    );
  }

  /**
   * Lock or unlock form fields based on role.
   * Nurses: only vitalSignsRecords is editable — all other fields are disabled.
   * Doctors / Admins: all fields enabled.
   */
  private applyRolePermissions(): void {
    if (this.isNurse) {
      this.NURSE_LOCKED_FIELDS.forEach(field => {
        this.form.get(field)?.disable();
      });
    } else {
      this.NURSE_LOCKED_FIELDS.forEach(field => {
        this.form.get(field)?.enable();
      });
    }
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
      // Existing VS: preserve original recorder name. New VS: stamp with current user.
      recordedBy:       [{ value: vs?.recordedBy || this.currentUserName, disabled: true }]
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
        // Build name cache from embedded data (works for nurses who can't call admin API)
        this.buildPatientCacheFromHospitalizations();
      },
      error: err => console.error('Error loading hospitalizations', err)
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue(); // includes disabled fields
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

    this.selectedPatient = this.patientUsers.find(u => u.id === h.userId) || null;

    this.form.patchValue({
      ...h,
      admissionDate:     this.formatDateForInput(h.admissionDate),
      dischargeDate:     this.formatDateForInput(h.dischargeDate),
      status:            h.status?.toLowerCase(),
      // Preserve the ORIGINAL attending doctor — never overwrite with the current user
      // (a nurse editing vital signs must not replace the doctor's ID)
      attendingDoctorId: h.attendingDoctorId || this.currentUserId
    });

    this.vitalSigns.clear();
    (h.vitalSignsRecords || []).forEach((vs: any) => this.addVitalSign(vs));

    // Apply role-based field locking AFTER patching values
    this.applyRolePermissions();
  }

  delete(id?: number): void {
    if (!id) return;
    if (this.isNurse) return; // guard: nurses cannot delete
    if (!confirm('Delete this hospitalization record?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Error deleting hospitalization', err)
    });
  }

  cancel(): void {
    this.editingId       = null;
    this.selectedPatient = null;
    this.form.reset();
    this.form.get('attendingDoctorId')?.setValue(this.currentUserId);
    this.vitalSigns.clear();
    // Re-enable all fields on cancel (nurse fields stay locked only during edit)
    this.NURSE_LOCKED_FIELDS.forEach(f => this.form.get(f)?.enable());
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
    if (!userId) return '—';
    // 1. Try Keycloak user list (doctors/admins)
    const found = this.patientUsers.find(u => u.id === userId);
    if (found) return KeycloakAdminService.displayName(found);
    // 2. Try name cache (nurses / fallback from hospitalization data)
    if (this.patientNameCache.has(userId)) return this.patientNameCache.get(userId)!;
    // 3. Loading or truly unknown
    return this.patientsLoading ? 'Loading…' : `Patient #${userId.slice(0, 8)}`;
  }

  getPatientInitials(userId: string): string {
    const name = this.getPatientDisplayName(userId);
    if (!name || name.startsWith('Patient #') || name === 'Loading…') return '?';
    return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  /** Role-aware title prefix shown in the UI (e.g. "Dr.", "Nurse") */
  get currentUserTitle(): string {
    if (this.isNurse)  return 'Nurse';
    if (this.isDoctor) return 'Dr.';
    return '';
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