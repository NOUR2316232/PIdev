import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { HospitalizationService } from './hospitalization.service';

export interface CriticalNotification {
  id: string;
  hospitalizationId: number;
  patientId: number;
  roomNumber: string;
  type: 'temperature' | 'heartRate' | 'oxygenSaturation' | 'respiratoryRate' | 'multiple';
  message: string;
  details: string[];
  severity: 'critical' | 'warning';
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private readonly POLL_INTERVAL_MS = 30_000;

  private notifications$ = new BehaviorSubject<CriticalNotification[]>([]);
  private pollSub?: Subscription;

  /** Observable that components subscribe to */
  notifications = this.notifications$.asObservable();

  get unreadCount(): number {
    return this.notifications$.value.filter(n => !n.read).length;
  }

  get allNotifications(): CriticalNotification[] {
    return this.notifications$.value;
  }

  constructor(
    private hospService: HospitalizationService,
    private keycloakService: KeycloakService
  ) {
    // Only doctors receive notifications — guard at the service level
    // so no HTTP calls are ever made for other roles
    if (this.keycloakService.isUserInRole('doctor')) {
      this.startPolling();
    }
  }

  // ── Polling ───────────────────────────────────────────────────────────────

  startPolling(): void {
    this.checkForCriticals();
    this.pollSub = interval(this.POLL_INTERVAL_MS)
      .subscribe(() => this.checkForCriticals());
  }

  /**
   * Fetches ALL hospitalizations from the database,
   * evaluates every vital-signs record against clinical thresholds,
   * and pushes new notifications only for records not already tracked.
   */
  private checkForCriticals(): void {
    this.hospService.getAll().subscribe({
      next: (data: any[]) => {
        const currentNotifs = this.notifications$.value;
        const newNotifs: CriticalNotification[] = [];

        data.forEach(h => {
          if (!h.vitalSignsRecords?.length) return;

          h.vitalSignsRecords.forEach((vs: any) => {
            // Evaluate this record against clinical thresholds
            const alerts = this.evaluateVitals(vs);
            if (!alerts.length) return;             // vitals are normal — skip

            // Unique key: hospitalization id + record timestamp
            const notifId = `${h.id}-${vs.recordDate}`;

            // Do not duplicate already-tracked notifications
            if (currentNotifs.some(n => n.id === notifId)) return;

            const severity: CriticalNotification['severity'] =
              alerts.some(a => a.critical) ? 'critical' : 'warning';

            const type: CriticalNotification['type'] =
              alerts.length > 1 ? 'multiple' : alerts[0].type;

            newNotifs.push({
              id: notifId,
              hospitalizationId: h.id,
              patientId: h.userId,
              roomNumber: h.roomNumber || '—',
              type,
              message: severity === 'critical'
                ? `Critical vitals — Room ${h.roomNumber || '—'} · Patient #${h.userId}`
                : `Abnormal vitals — Room ${h.roomNumber || '—'} · Patient #${h.userId}`,
              details: alerts.map(a => a.message),
              severity,
              timestamp: new Date(vs.recordDate),
              read: false,
              acknowledged: false
            });
          });
        });

        if (newNotifs.length) {
          // Prepend newest notifications and sort: critical first, then newest first
          const merged = [...newNotifs, ...currentNotifs];
          merged.sort((a, b) => {
            if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          this.notifications$.next(merged);
        }
      },
      error: err => console.error('Notification poll error', err)
    });
  }

  // ── Clinical thresholds ───────────────────────────────────────────────────
  /**
   * Pure evaluation of a single vital-signs record.
   * Returns an empty array when all values are within normal range.
   * Single source of truth for all thresholds.
   */
  private evaluateVitals(
    vs: any
  ): { type: CriticalNotification['type']; message: string; critical: boolean }[] {

    const alerts: { type: CriticalNotification['type']; message: string; critical: boolean }[] = [];

    // ── Temperature (°C) ──────────────────────────────────────────────────
    if (vs.temperature != null) {
      if (vs.temperature > 39.5)
        alerts.push({ type: 'temperature', message: `High fever: ${vs.temperature}°C (>39.5°C)`, critical: true });
      else if (vs.temperature > 38)
        alerts.push({ type: 'temperature', message: `Fever: ${vs.temperature}°C (>38°C)`, critical: false });
      else if (vs.temperature < 35)
        alerts.push({ type: 'temperature', message: `Hypothermia: ${vs.temperature}°C (<35°C)`, critical: true });
      else if (vs.temperature < 36)
        alerts.push({ type: 'temperature', message: `Low temperature: ${vs.temperature}°C (<36°C)`, critical: false });
    }

    // ── Heart rate (bpm) ──────────────────────────────────────────────────
    if (vs.heartRate != null) {
      if (vs.heartRate > 150)
        alerts.push({ type: 'heartRate', message: `Severe tachycardia: ${vs.heartRate} bpm (>150)`, critical: true });
      else if (vs.heartRate > 100)
        alerts.push({ type: 'heartRate', message: `Tachycardia: ${vs.heartRate} bpm (>100)`, critical: false });
      else if (vs.heartRate < 40)
        alerts.push({ type: 'heartRate', message: `Severe bradycardia: ${vs.heartRate} bpm (<40)`, critical: true });
      else if (vs.heartRate < 60)
        alerts.push({ type: 'heartRate', message: `Bradycardia: ${vs.heartRate} bpm (<60)`, critical: false });
    }

    // ── Oxygen saturation (%) ─────────────────────────────────────────────
    if (vs.oxygenSaturation != null) {
      if (vs.oxygenSaturation < 90)
        alerts.push({ type: 'oxygenSaturation', message: `Critical SpO₂: ${vs.oxygenSaturation}% (<90%)`, critical: true });
      else if (vs.oxygenSaturation < 95)
        alerts.push({ type: 'oxygenSaturation', message: `Low SpO₂: ${vs.oxygenSaturation}% (<95%)`, critical: false });
    }

    // ── Respiratory rate (/min) ───────────────────────────────────────────
    if (vs.respiratoryRate != null) {
      if (vs.respiratoryRate > 30 || vs.respiratoryRate < 8)
        alerts.push({ type: 'respiratoryRate', message: `Critical resp. rate: ${vs.respiratoryRate}/min`, critical: true });
      else if (vs.respiratoryRate > 20 || vs.respiratoryRate < 12)
        alerts.push({ type: 'respiratoryRate', message: `Abnormal resp. rate: ${vs.respiratoryRate}/min`, critical: false });
    }

    return alerts;
  }

  // ── Public actions ────────────────────────────────────────────────────────

  markAllRead(): void {
    const updated = this.notifications$.value.map(n => ({ ...n, read: true }));
    this.notifications$.next(updated);
  }

  markRead(id: string): void {
    const updated = this.notifications$.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$.next(updated);
  }

  acknowledge(id: string): void {
    const updated = this.notifications$.value.map(n =>
      n.id === id ? { ...n, acknowledged: true, read: true } : n
    );
    this.notifications$.next(updated);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}