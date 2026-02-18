import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalizationService } from '../../services/hospitalization.service';

@Component({
  selector: 'app-statistique-hospitalization',
  templateUrl: './statistique-hospitalization.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class StatistiqueHospitalizationComponent implements OnInit {

  loading = true;

  // ── KPIs ──────────────────────────────────────────────────
  total      = 0;
  active     = 0;
  pending    = 0;
  discharged = 0;

  // ── Extended KPIs ─────────────────────────────────────────
  avgStayDays        = 0;
  criticalVitalsCount = 0;
  totalVitalsRecorded = 0;
  abnormalVitalsCount = 0;
  uniqueRooms        = 0;
  uniqueDoctors      = 0;
  uniquePatients     = 0;
  longestStayDays    = 0;
  shortestStayDays   = 0;
  todayAdmissions    = 0;
  thisWeekAdmissions = 0;
  readmissionCount   = 0; // patients hospitalized more than once

  // ── Donut chart ───────────────────────────────────────────
  readonly SIZE   = 160;
  readonly STROKE = 22;
  get radius()      { return (this.SIZE - this.STROKE) / 2; }
  get circumference(){ return 2 * Math.PI * this.radius; }

  get activePercent()    { return this.total ? this.active    / this.total : 0; }
  get pendingPercent()   { return this.total ? this.pending   / this.total : 0; }
  get dischargedPercent(){ return this.total ? this.discharged/ this.total : 0; }

  get activeOffset()    { return 0; }
  get pendingOffset()   { return this.activePercent * this.circumference; }
  get dischargedOffset(){ return (this.activePercent + this.pendingPercent) * this.circumference; }

  get activeDash()    { return this.activePercent    * this.circumference; }
  get pendingDash()   { return this.pendingPercent   * this.circumference; }
  get dischargedDash(){ return this.dischargedPercent * this.circumference; }

  // ── Monthly admissions (last 6 months) ───────────────────
  monthlyAdmissions: { label: string; count: number }[] = [];
  maxMonthlyCount = 1;

  // ── Weekly admissions (last 7 days) ─────────────────────
  weeklyAdmissions: { label: string; count: number }[] = [];
  maxWeeklyCount = 1;

  // ── Top admission reasons ─────────────────────────────────
  topReasons: { reason: string; count: number; percent: string }[] = [];

  // ── Doctor workload ───────────────────────────────────────
  doctorWorkload: { doctorId: string; count: number; active: number }[] = [];

  // ── Room occupancy ────────────────────────────────────────
  roomOccupancy: { room: string; count: number; active: boolean }[] = [];

  // ── Vital signs breakdown ─────────────────────────────────
  vitalsBreakdown = {
    fever:        0,
    lowTemp:      0,
    tachycardia:  0,
    bradycardia:  0,
    lowSpo2:      0,
    abnormalResp: 0
  };

  // ── Status over time (last 6 months, stacked) ────────────
  monthlyByStatus: {
    label: string;
    active: number;
    pending: number;
    discharged: number;
  }[] = [];

  constructor(private service: HospitalizationService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.computeAll(data);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private computeAll(data: any[]): void {
    const now = new Date();

    // ── Basic KPIs ─────────────────────────────────────────
    this.total      = data.length;
    this.active     = data.filter(h => h.status === 'active').length;
    this.pending    = data.filter(h => h.status === 'pending').length;
    this.discharged = data.filter(h => h.status === 'discharged').length;

    // ── Unique rooms / doctors / patients ─────────────────
    this.uniqueRooms    = new Set(data.map(h => h.roomNumber).filter(Boolean)).size;
    this.uniqueDoctors  = new Set(data.map(h => h.attendingDoctorId).filter(Boolean)).size;
    this.uniquePatients = new Set(data.map(h => h.userId).filter(Boolean)).size;

    // ── Stay durations ─────────────────────────────────────
    const withDates = data.filter(h => h.admissionDate && h.dischargeDate);
    if (withDates.length) {
      const days = withDates.map(h => {
        const diff = new Date(h.dischargeDate).getTime() - new Date(h.admissionDate).getTime();
        return diff / (1000 * 60 * 60 * 24);
      });
      this.avgStayDays      = Math.round((days.reduce((a, b) => a + b, 0) / days.length) * 10) / 10;
      this.longestStayDays  = Math.round(Math.max(...days));
      this.shortestStayDays = Math.round(Math.min(...days));
    }

    // ── Today / this week admissions ─────────────────────
    const todayStr = now.toDateString();
    const weekAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.todayAdmissions    = data.filter(h => h.admissionDate && new Date(h.admissionDate).toDateString() === todayStr).length;
    this.thisWeekAdmissions = data.filter(h => h.admissionDate && new Date(h.admissionDate) >= weekAgo).length;

    // ── Readmissions (same userId appears > 1) ────────────
    const patientCounts: Record<string, number> = {};
    data.forEach(h => {
      const id = String(h.userId || '');
      if (id) patientCounts[id] = (patientCounts[id] || 0) + 1;
    });
    this.readmissionCount = Object.values(patientCounts).filter(c => c > 1).length;

    // ── Vital signs ───────────────────────────────────────
    const allVS = data.flatMap(h => h.vitalSignsRecords || []);
    this.totalVitalsRecorded = allVS.length;

    allVS.forEach(vs => {
      if (vs.temperature > 38)                                    this.vitalsBreakdown.fever++;
      if (vs.temperature < 36)                                    this.vitalsBreakdown.lowTemp++;
      if (vs.heartRate > 100)                                     this.vitalsBreakdown.tachycardia++;
      if (vs.heartRate < 60)                                      this.vitalsBreakdown.bradycardia++;
      if (vs.oxygenSaturation < 95)                               this.vitalsBreakdown.lowSpo2++;
      if (vs.respiratoryRate < 12 || vs.respiratoryRate > 20)     this.vitalsBreakdown.abnormalResp++;
    });

    this.abnormalVitalsCount =
      this.vitalsBreakdown.fever + this.vitalsBreakdown.lowTemp +
      this.vitalsBreakdown.tachycardia + this.vitalsBreakdown.bradycardia +
      this.vitalsBreakdown.lowSpo2 + this.vitalsBreakdown.abnormalResp;

    this.criticalVitalsCount = data.filter(h =>
      (h.vitalSignsRecords || []).some((vs: any) =>
        vs.temperature > 39.5 || vs.oxygenSaturation < 90 || vs.heartRate > 150 || vs.heartRate < 40
      )
    ).length;

    // ── Monthly admissions (last 6 months) ───────────────
    const months: typeof this.monthlyAdmissions = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const count = data.filter(h => {
        if (!h.admissionDate) return false;
        const ad = new Date(h.admissionDate);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    this.monthlyAdmissions = months;
    this.maxMonthlyCount   = Math.max(...months.map(m => m.count), 1);

    // ── Monthly by status (stacked) ───────────────────────
    const mbs: typeof this.monthlyByStatus = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const inMonth = data.filter(h => {
        if (!h.admissionDate) return false;
        const ad = new Date(h.admissionDate);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      });
      mbs.push({
        label,
        active:     inMonth.filter(h => h.status === 'active').length,
        pending:    inMonth.filter(h => h.status === 'pending').length,
        discharged: inMonth.filter(h => h.status === 'discharged').length,
      });
    }
    this.monthlyByStatus = mbs;

    // ── Weekly admissions (last 7 days) ──────────────────
    const days7: typeof this.weeklyAdmissions = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = d.toLocaleString('default', { weekday: 'short' });
      const count = data.filter(h => {
        if (!h.admissionDate) return false;
        const ad = new Date(h.admissionDate);
        return ad.toDateString() === d.toDateString();
      }).length;
      days7.push({ label, count });
    }
    this.weeklyAdmissions = days7;
    this.maxWeeklyCount   = Math.max(...days7.map(d => d.count), 1);

    // ── Top 5 admission reasons ───────────────────────────
    const reasonMap: Record<string, number> = {};
    data.forEach(h => {
      const r = (h.admissionReason || 'Unknown').trim();
      reasonMap[r] = (reasonMap[r] || 0) + 1;
    });
    this.topReasons = Object.entries(reasonMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({
        reason,
        count,
        percent: this.total ? Math.round((count / this.total) * 100) + '%' : '0%'
      }));

    // ── Doctor workload (top 5) ───────────────────────────
    const docMap: Record<string, { count: number; active: number }> = {};
    data.forEach(h => {
      const id = String(h.attendingDoctorId || 'Unknown');
      if (!docMap[id]) docMap[id] = { count: 0, active: 0 };
      docMap[id].count++;
      if (h.status === 'active') docMap[id].active++;
    });
    this.doctorWorkload = Object.entries(docMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([doctorId, v]) => ({ doctorId, ...v }));

    // ── Room occupancy (top 8) ────────────────────────────
    const roomMap: Record<string, { count: number; active: boolean }> = {};
    data.forEach(h => {
      const r = h.roomNumber || 'N/A';
      if (!roomMap[r]) roomMap[r] = { count: 0, active: false };
      roomMap[r].count++;
      if (h.status === 'active') roomMap[r].active = true;
    });
    this.roomOccupancy = Object.entries(roomMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([room, v]) => ({ room, ...v }));
  }

  percent(value: number): string {
    return this.total ? Math.round((value / this.total) * 100) + '%' : '0%';
  }

  barWidth(count: number, max: number = this.maxMonthlyCount): string {
    return Math.round((count / max) * 100) + '%';
  }

  stackedHeight(count: number): string {
    const max = Math.max(...this.monthlyByStatus.map(m => m.active + m.pending + m.discharged), 1);
    return Math.round((count / max) * 100) + '%';
  }
}