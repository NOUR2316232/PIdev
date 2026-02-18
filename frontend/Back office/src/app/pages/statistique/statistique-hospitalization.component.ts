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

  total = 0;
  active = 0;
  pending = 0;
  discharged = 0;
  loading = true;

  // For the SVG donut chart
  readonly SIZE = 160;
  readonly STROKE = 22;
  get radius() { return (this.SIZE - this.STROKE) / 2; }
  get circumference() { return 2 * Math.PI * this.radius; }

  get activePercent()    { return this.total ? this.active / this.total : 0; }
  get pendingPercent()   { return this.total ? this.pending / this.total : 0; }
  get dischargedPercent(){ return this.total ? this.discharged / this.total : 0; }

  // Each segment: offset = sum of all previous segments
  get activeOffset()     { return 0; }
  get pendingOffset()    { return this.activePercent * this.circumference; }
  get dischargedOffset() { return (this.activePercent + this.pendingPercent) * this.circumference; }

  get activeDash()       { return this.activePercent * this.circumference; }
  get pendingDash()      { return this.pendingPercent * this.circumference; }
  get dischargedDash()   { return this.dischargedPercent * this.circumference; }

  // Average stay duration (days)
  avgStayDays = 0;

  // Last 6 months admissions (computed from data)
  monthlyAdmissions: { label: string; count: number }[] = [];
  maxMonthlyCount = 1;

  constructor(private service: HospitalizationService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.total      = data.length;
        this.active     = data.filter(h => h.status === 'active').length;
        this.pending    = data.filter(h => h.status === 'pending').length;
        this.discharged = data.filter(h => h.status === 'discharged').length;

        // Average stay duration for discharged patients
        const withDates = data.filter(h => h.admissionDate && h.dischargeDate);
        if (withDates.length) {
          const totalDays = withDates.reduce((sum, h) => {
            const diff = new Date(h.dischargeDate).getTime() - new Date(h.admissionDate).getTime();
            return sum + diff / (1000 * 60 * 60 * 24);
          }, 0);
          this.avgStayDays = Math.round(totalDays / withDates.length * 10) / 10;
        }

        // Monthly admissions — last 6 months
        const now = new Date();
        const months: { label: string; count: number }[] = [];
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
        this.maxMonthlyCount = Math.max(...months.map(m => m.count), 1);

        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  percent(value: number): string {
    return this.total ? Math.round((value / this.total) * 100) + '%' : '0%';
  }

  barWidth(count: number): string {
    return Math.round((count / this.maxMonthlyCount) * 100) + '%';
  }
}