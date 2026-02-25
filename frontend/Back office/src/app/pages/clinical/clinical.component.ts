import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ClinicalService,
  MedicalHistory,
  TriageAssessmentRequest,
  TriageLevel,
  TriageQueueItem
} from '../../services/clinical.service';

@Component({
  selector: 'app-clinical',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clinical.component.html',
  styleUrls: ['./clinical.component.css']
})
export class ClinicalComponent implements OnInit, OnDestroy {
  medicalHistories: MedicalHistory[] = [];
  form: FormGroup; // medical history form
  triageForm: FormGroup;
  queueItems: TriageQueueItem[] = [];
  submittingTriage = false;
  loadingQueue = false;
  triageSuccess: string | null = null;
  triageError: string | null = null;
  readonly triageLevels: TriageLevel[] = ['RED', 'ORANGE', 'YELLOW', 'GREEN'];
  private queueRefreshTimer: ReturnType<typeof setInterval> | null = null;

  editingId: number | null = null;
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private clinicalService: ClinicalService) {
    this.form = this.fb.group({
      userId: [null],
      diagnosis: [''],
      allergies: [''],
      chronicConditions: [''],
      familyHistory: [''],
      notes: ['']
    });

    this.triageForm = this.fb.group({
      patientId: [null, [Validators.required, Validators.min(1)]],
      arrivalTime: [this.defaultArrivalTime(), Validators.required],
      heartRate: [null, [Validators.min(20), Validators.max(250)]],
      systolicBp: [null, [Validators.min(40), Validators.max(300)]],
      spo2: [null, [Validators.min(50), Validators.max(100)]],
      painScore: [null, [Validators.min(0), Validators.max(10)]],
      age: [null, [Validators.min(0), Validators.max(130)]],
      severeComorbidity: [false],
      respiratoryDistress: [false]
    });
  }

  ngOnInit(): void {
    this.loadMedicalHistories();
    this.loadQueue();
    this.queueRefreshTimer = setInterval(() => this.loadQueue(false), 20000);
  }

  ngOnDestroy(): void {
    if (this.queueRefreshTimer) {
      clearInterval(this.queueRefreshTimer);
      this.queueRefreshTimer = null;
    }
  }

  loadMedicalHistories(): void {
    this.error = null;
    this.clinicalService.getAllMedicalHistories().subscribe({
      next: (data) => {
        this.medicalHistories = data;
      },
      error: (err) => {
        this.error = 'Failed to load medical histories: ' + err.message;
        console.error('Error loading medical histories', err);
      }
    });
  }

  submitTriageAssessment(): void {
    if (this.triageForm.invalid) {
      this.triageForm.markAllAsTouched();
      this.triageError = 'Please fill triage required fields correctly.';
      return;
    }

    this.submittingTriage = true;
    this.triageError = null;
    this.triageSuccess = null;

    const formValue = this.triageForm.value;
    const payload: TriageAssessmentRequest = {
      patientId: Number(formValue.patientId),
      arrivalTime: this.normalizeLocalDateTime(formValue.arrivalTime),
      heartRate: this.normalizeNumber(formValue.heartRate),
      systolicBp: this.normalizeNumber(formValue.systolicBp),
      spo2: this.normalizeNumber(formValue.spo2),
      painScore: this.normalizeNumber(formValue.painScore),
      age: this.normalizeNumber(formValue.age),
      severeComorbidity: !!formValue.severeComorbidity,
      respiratoryDistress: !!formValue.respiratoryDistress
    };

    this.clinicalService.createTriageAssessment(payload).subscribe({
      next: (res) => {
        this.submittingTriage = false;
        this.triageSuccess = `Assessment created. Queue #${res.queueItemId} | Level ${res.triageLevel} | Score ${res.score}`;
        this.triageForm.patchValue({
          arrivalTime: this.defaultArrivalTime(),
          heartRate: null,
          systolicBp: null,
          spo2: null,
          painScore: null,
          age: null,
          severeComorbidity: false,
          respiratoryDistress: false
        });
        this.loadQueue(false);
      },
      error: (err) => {
        this.submittingTriage = false;
        this.triageError = `Failed to create triage assessment: ${err.message}`;
      }
    });
  }

  loadQueue(showLoader = true): void {
    if (showLoader) {
      this.loadingQueue = true;
    }

    this.clinicalService.getTriageQueue().subscribe({
      next: (items) => {
        this.queueItems = items;
        this.loadingQueue = false;
      },
      error: (err) => {
        this.loadingQueue = false;
        this.triageError = `Failed to load triage queue: ${err.message}`;
      }
    });
  }

  startCare(item: TriageQueueItem): void {
    const input = prompt(`Doctor ID for queue #${item.queueItemId}:`);
    if (!input) {
      return;
    }

    const doctorId = Number(input);
    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      this.triageError = 'Invalid doctor ID.';
      return;
    }

    this.triageError = null;
    this.clinicalService.startCare(item.queueItemId, { doctorId }).subscribe({
      next: () => {
        this.triageSuccess = `Queue #${item.queueItemId} started by doctor ${doctorId}.`;
        this.loadQueue(false);
      },
      error: (err) => {
        this.triageError = `Start care failed: ${err.message}`;
      }
    });
  }

  closeQueueItem(item: TriageQueueItem): void {
    if (!confirm(`Close queue item #${item.queueItemId}?`)) {
      return;
    }

    this.triageError = null;
    this.clinicalService.closeQueueItem(item.queueItemId).subscribe({
      next: () => {
        this.triageSuccess = `Queue #${item.queueItemId} marked as completed.`;
        this.loadQueue(false);
      },
      error: (err) => {
        this.triageError = `Close queue item failed: ${err.message}`;
      }
    });
  }

  overrideQueueItem(item: TriageQueueItem): void {
    const triageLevelInput = prompt('New triage level (RED/ORANGE/YELLOW/GREEN):', item.triageLevel);
    if (!triageLevelInput) {
      return;
    }

    const triageLevel = triageLevelInput.toUpperCase() as TriageLevel;
    if (!this.triageLevels.includes(triageLevel)) {
      this.triageError = 'Invalid triage level.';
      return;
    }

    const reason = prompt('Override reason (required):');
    if (!reason || !reason.trim()) {
      this.triageError = 'Override reason is required.';
      return;
    }

    const maxWaitInput = prompt('Max wait in minutes (optional):', String(item.maxWaitMinutes));
    const maxWaitParsed = maxWaitInput && maxWaitInput.trim() !== '' ? Number(maxWaitInput) : null;
    if (maxWaitParsed !== null && (!Number.isFinite(maxWaitParsed) || maxWaitParsed < 0 || maxWaitParsed > 360)) {
      this.triageError = 'Max wait must be between 0 and 360.';
      return;
    }

    this.triageError = null;
    this.clinicalService.overrideQueueItem(item.queueItemId, {
      triageLevel,
      maxWaitMinutes: maxWaitParsed,
      overrideReason: reason.trim()
    }).subscribe({
      next: () => {
        this.triageSuccess = `Queue #${item.queueItemId} overridden to ${triageLevel}.`;
        this.loadQueue(false);
      },
      error: (err) => {
        this.triageError = `Override failed: ${err.message}`;
      }
    });
  }

  canStart(item: TriageQueueItem): boolean {
    return item.status === 'WAITING' || item.status === 'IN_PROGRESS';
  }

  canClose(item: TriageQueueItem): boolean {
    return item.status === 'WAITING' || item.status === 'IN_PROGRESS';
  }

  canOverride(item: TriageQueueItem): boolean {
    return item.status === 'WAITING' || item.status === 'IN_PROGRESS';
  }

  levelClass(level: TriageLevel): string {
    switch (level) {
      case 'RED':
        return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400';
      case 'ORANGE':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400';
      case 'YELLOW':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300';
      case 'GREEN':
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400';
    }
  }

  slaClass(deadlineAt: string, status: string): string {
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      return 'text-slate-500 dark:text-slate-400';
    }

    const minutes = this.minutesToDeadline(deadlineAt);
    if (minutes < 0) {
      return 'text-red-600 dark:text-red-400 font-semibold';
    }
    if (minutes <= 10) {
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    }
    return 'text-green-600 dark:text-green-400';
  }

  minutesToDeadline(deadlineAt: string): number {
    const now = Date.now();
    const deadline = new Date(deadlineAt).getTime();
    return Math.floor((deadline - now) / 60000);
  }

  formatTime(value?: string | null): string {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString();
  }

  saveMedicalHistory(): void {
    if (this.editingId == null) {
      this.error = 'Creation is available in Front Office. Use Edit here to update existing records.';
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
    const medicalHistory: MedicalHistory = {
      userId: this.editingId 
        ? (this.medicalHistories.find(m => m.id === this.editingId)?.userId || Number(formValue.userId)) 
        : Number(formValue.userId),
      diagnosis: formValue.diagnosis || '',
      allergies: formValue.allergies || '',
      chronicConditions: formValue.chronicConditions || '',
      familyHistory: formValue.familyHistory || '',
      notes: formValue.notes || ''
    };

    this.clinicalService.updateMedicalHistory(this.editingId, medicalHistory).subscribe({
      next: () => {
        this.success = 'Medical history updated successfully!';
        this.loadMedicalHistories();
        this.cancelEdit();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Error updating medical history: ' + err.message;
        console.error('Error updating medical history', err);
      }
    });
  }

  editMedicalHistory(medicalHistory: MedicalHistory): void {
    this.error = null;
    this.success = null;
    this.editingId = medicalHistory.id ?? null;
    this.form.patchValue({
      userId: medicalHistory.userId,
      diagnosis: medicalHistory.diagnosis || '',
      allergies: medicalHistory.allergies || '',
      chronicConditions: medicalHistory.chronicConditions || '',
      familyHistory: medicalHistory.familyHistory || '',
      notes: medicalHistory.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteMedicalHistory(id: number | undefined): void {
    if (id == null) {
      return;
    }

    if (!confirm('Are you sure you want to delete this medical history?')) {
      return;
    }

    this.error = null;
    this.clinicalService.deleteMedicalHistory(id).subscribe({
      next: () => {
        this.success = 'Medical history deleted successfully!';
        this.loadMedicalHistories();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Error deleting medical history: ' + err.message;
        console.error('Error deleting medical history', err);
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset();
    this.error = null;
  }

  private normalizeNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private defaultArrivalTime(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  private normalizeLocalDateTime(value: string): string {
    if (!value) {
      return value;
    }
    return value.length === 16 ? `${value}:00` : value;
  }
}
