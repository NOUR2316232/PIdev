import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClinicalService, Consultation, MedicalHistory } from '../services/clinical.service';
import { UserService } from '../services/user.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-clinical',
  standalone: false,
  templateUrl: './clinical.component.html',
  styleUrls: ['./clinical.component.css']
})
export class ClinicalComponent implements OnInit {
  form: FormGroup;
  medicalHistoryForm: FormGroup;
  error: string | null = null;
  success: string | null = null;
  availablePatientIds: number[] = [];
  availableDoctorIds: number[] = [];
  currentPatientId: number | null = null;
  loadingProfile = false;
  loadingIds = false;
  showMedicalHistoryModal = false;
  savingMedicalHistory = false;

  constructor(
    private fb: FormBuilder,
    private clinicalService: ClinicalService,
    private userService: UserService,
    private keycloakService: KeycloakService
  ) {
    this.form = this.fb.group({
      patientId: [null],
      doctorId: [null, Validators.required],
      consultationDate: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatmentPlan: ['', Validators.required]
    });

    this.medicalHistoryForm = this.fb.group({
      allergies: [''],
      diagnosis: [''],
      chronicConditions: [''],
      familyHistory: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentPatient();
    this.loadAvailableIds();
  }

  saveConsultation(): void {
    const effectivePatientId = this.getEffectivePatientId();

    if (effectivePatientId == null) {
      this.error = 'Unable to determine patient account. Select Patient ID manually and try again.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fill in all required fields';
      return;
    }

    this.error = null;
    this.success = null;

    const formValue = this.form.value;
    const consultation: Consultation = {
      patientId: effectivePatientId,
      doctorId: Number(formValue.doctorId),
      consultationDate: formValue.consultationDate,
      diagnosis: formValue.diagnosis,
      treatmentPlan: formValue.treatmentPlan,
      followUpDate: null,
      status: 'SCHEDULED'
    };

    this.clinicalService.createConsultation(consultation).subscribe({
      next: () => {
        this.success = 'Consultation created successfully!';
        this.form.reset({ patientId: null, doctorId: null });
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.error = 'Error creating consultation: ' + err.message;
        console.error('Error creating consultation', err);
      }
    });
  }

  openMedicalHistoryModal(): void {
    this.error = null;
    this.showMedicalHistoryModal = true;
  }

  closeMedicalHistoryModal(): void {
    this.showMedicalHistoryModal = false;
    this.medicalHistoryForm.reset();
  }

  saveMedicalHistory(): void {
    const effectivePatientId = this.getEffectivePatientId();
    if (effectivePatientId == null) {
      this.error = 'Unable to determine patient account. Select Patient ID first.';
      return;
    }

    const formValue = this.medicalHistoryForm.value;
    const medicalHistory: MedicalHistory = {
      userId: effectivePatientId,
      diagnosis: formValue.diagnosis || '',
      allergies: formValue.allergies || '',
      chronicConditions: formValue.chronicConditions || '',
      familyHistory: formValue.familyHistory || '',
      notes: formValue.notes || ''
    };

    this.error = null;
    this.savingMedicalHistory = true;

    this.clinicalService.createMedicalHistory(medicalHistory).subscribe({
      next: () => {
        this.success = 'Medical history created successfully!';
        this.closeMedicalHistoryModal();
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.error = 'Error creating medical history: ' + err.message;
        console.error('Error creating medical history', err);
      },
      complete: () => {
        this.savingMedicalHistory = false;
      }
    });
  }

  private async loadCurrentPatient(): Promise<void> {
    this.loadingProfile = true;
    this.error = null;

    try {
      const profile = await this.userService.getProfile();
      this.currentPatientId = this.extractProfileUserId(profile);

      if (this.currentPatientId == null) {
        this.currentPatientId = this.extractTokenUserId();
      }
    } catch (err: any) {
      console.warn('Profile endpoint unavailable, trying token fallback', err);
      this.currentPatientId = this.extractTokenUserId();

      if (this.currentPatientId == null) {
        // Fall back to manual patient selection without surfacing a blocking error.
        this.error = null;
      }
    } finally {
      this.loadingProfile = false;
    }
  }

  private extractProfileUserId(profile: any): number | null {
    const candidates = [
      profile?.id,
      profile?.userId,
      profile?.user?.id,
      profile?.data?.id,
      profile?.data?.userId
    ];

    for (const value of candidates) {
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  private extractTokenUserId(): number | null {
    const tokenParsed: any = this.keycloakService.getKeycloakInstance()?.tokenParsed;
    if (!tokenParsed) {
      return null;
    }

    const candidates = [
      tokenParsed?.id,
      tokenParsed?.userId,
      tokenParsed?.user_id,
      tokenParsed?.uid,
      tokenParsed?.sub
    ];

    for (const value of candidates) {
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  private getEffectivePatientId(): number | null {
    const manualPatientId = Number(this.form.get('patientId')?.value);
    return this.currentPatientId ??
      (Number.isInteger(manualPatientId) && manualPatientId > 0 ? manualPatientId : null);
  }

  private loadAvailableIds(): void {
    this.loadingIds = true;

    this.clinicalService.getAvailablePatientIds().subscribe({
      next: (ids) => {
        this.availablePatientIds = ids ?? [];
      },
      error: (err) => {
        console.error('Error loading patient IDs', err);
        this.error = 'Unable to load patient IDs from database.';
      }
    });

    this.clinicalService.getAvailableDoctorIds().subscribe({
      next: (ids) => {
        this.availableDoctorIds = ids ?? [];
      },
      error: (err) => {
        console.error('Error loading doctor IDs', err);
        this.error = 'Unable to load doctor IDs from database.';
      },
      complete: () => {
        this.loadingIds = false;
      }
    });
  }
}
