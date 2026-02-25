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

  // ── Section 1: Hospitalization Status ─────────────────────
  total      = 0;
  active     = 0;
  pending    = 0;
  discharged = 0;

  // ── Section 2: Vital Signs Anomalies ──────────────────────
  totalVitalsRecorded = 0;
  vitalsBreakdown = {
    fever:        0,   // temp > 38°C
    lowTemp:      0,   // temp < 36°C
    tachycardia:  0,   // heart rate > 100 bpm
    bradycardia:  0,   // heart rate < 60 bpm
    lowSpo2:      0,   // SpO₂ < 95%
    abnormalResp: 0,   // resp. rate outside 12–20
  };
  get totalAnomalies(): number {
    return Object.values(this.vitalsBreakdown).reduce((a, b) => a + b, 0);
  }

  // ── Donut helpers ─────────────────────────────────────────
  readonly SIZE   = 180;
  readonly STROKE = 26;
  get radius()        { return (this.SIZE - this.STROKE) / 2; }
  get circumference() { return 2 * Math.PI * this.radius; }

  private pct(n: number) { return this.total ? n / this.total : 0; }

  get activeDash()    { return this.pct(this.active)     * this.circumference; }
  get pendingDash()   { return this.pct(this.pending)    * this.circumference; }
  get dischargedDash(){ return this.pct(this.discharged) * this.circumference; }

  get activeOffset()    { return 0; }
  get pendingOffset()   { return this.pct(this.active) * this.circumference; }
  get dischargedOffset(){ return (this.pct(this.active) + this.pct(this.pending)) * this.circumference; }

  percent(n: number): string {
    return this.total ? Math.round((n / this.total) * 100) + '%' : '0%';
  }

  // ── Bar width helper for anomalies ────────────────────────
  anomalyBar(n: number): string {
    const max = Math.max(...Object.values(this.vitalsBreakdown), 1);
    return Math.round((n / max) * 100) + '%';
  }

  constructor(private service: HospitalizationService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.compute(data);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private compute(data: any[]): void {
    // Section 1
    this.total      = data.length;
    this.active     = data.filter(h => h.status === 'active').length;
    this.pending    = data.filter(h => h.status === 'pending').length;
    this.discharged = data.filter(h => h.status === 'discharged').length;

    // Section 2
    const allVS = data.flatMap(h => h.vitalSignsRecords || []);
    this.totalVitalsRecorded = allVS.length;

    this.vitalsBreakdown = { fever: 0, lowTemp: 0, tachycardia: 0, bradycardia: 0, lowSpo2: 0, abnormalResp: 0 };
    allVS.forEach(vs => {
      if (vs.temperature  > 38)                                { this.vitalsBreakdown.fever++; }
      if (vs.temperature  < 36)                                { this.vitalsBreakdown.lowTemp++; }
      if (vs.heartRate    > 100)                               { this.vitalsBreakdown.tachycardia++; }
      if (vs.heartRate    < 60)                                { this.vitalsBreakdown.bradycardia++; }
      if (vs.oxygenSaturation < 95)                            { this.vitalsBreakdown.lowSpo2++; }
      if (vs.respiratoryRate  < 12 || vs.respiratoryRate > 20) { this.vitalsBreakdown.abnormalResp++; }
    });
  }
}