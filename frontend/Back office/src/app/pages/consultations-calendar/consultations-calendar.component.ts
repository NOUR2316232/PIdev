import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ClinicalService, Consultation } from '../../services/clinical.service';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-consultations-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalComponent],
  templateUrl: './consultations-calendar.component.html',
  styleUrls: ['./consultations-calendar.component.css']
})
export class ConsultationsCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  consultations: Consultation[] = [];
  selectedConsultation: Consultation | null = null;
  isOpen = false;
  loading = true;
  error: string | null = null;
  success: string | null = null;
  updatingStatusId: number | null = null;
  editableFollowUpDates: Record<number, string> = {};
  calendarOptions!: CalendarOptions;

  readonly statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  constructor(private clinicalService: ClinicalService) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.clinicalService.getAllConsultations().subscribe({
      next: (data) => {
        this.consultations = (data ?? []).sort(
          (a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
        );
        this.editableFollowUpDates = {};
        this.consultations.forEach((consultation) => {
          if (consultation.id != null) {
            this.editableFollowUpDates[consultation.id] = this.toDateTimeLocal(consultation.followUpDate);
          }
        });
        this.initializeCalendar();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load consultations';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  initializeCalendar(): void {
    const events: EventInput[] = this.consultations.map((consultation) => ({
      id: consultation.id?.toString(),
      title: `Consultation - ${consultation.diagnosis || 'No diagnosis'}`,
      start: consultation.consultationDate,
      end: consultation.followUpDate || consultation.consultationDate,
      backgroundColor: this.getColorByStatus(consultation.status),
      borderColor: this.getColorByStatus(consultation.status),
      extendedProps: {
        doctorId: consultation.doctorId,
        patientId: consultation.patientId,
        diagnosis: consultation.diagnosis,
        treatmentPlan: consultation.treatmentPlan,
        status: consultation.status,
        fullConsultation: consultation
      }
    }));

    this.calendarOptions = {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      height: 'auto',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      events,
      eventClick: (info) => this.handleEventClick(info)
    };
  }

  handleEventClick(info: EventClickArg): void {
    this.selectedConsultation = info.event.extendedProps['fullConsultation'];
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
    this.selectedConsultation = null;
  }

  updateConsultationStatus(consultation: Consultation, newStatus: string, followUpDateInput: string): void {
    if (!consultation.id) {
      return;
    }

    const currentFollowUpLocal = this.toDateTimeLocal(consultation.followUpDate);
    const hasStatusChange = !!newStatus && consultation.status !== newStatus;
    const hasFollowUpChange = (followUpDateInput || '') !== currentFollowUpLocal;

    if (!hasStatusChange && !hasFollowUpChange) {
      return;
    }

    this.error = null;
    this.success = null;
    this.updatingStatusId = consultation.id;

    const normalizedFollowUpDate = followUpDateInput
      ? new Date(followUpDateInput).toISOString()
      : null;

    const updatedPayload: Consultation = {
      ...consultation,
      status: newStatus,
      followUpDate: normalizedFollowUpDate
    };

    this.clinicalService.updateConsultation(consultation.id, updatedPayload).subscribe({
      next: (updated) => {
        const updatedConsultation = updated ?? updatedPayload;
        this.consultations = this.consultations.map((item) =>
          item.id === consultation.id ? updatedConsultation : item
        );

        if (this.selectedConsultation?.id === consultation.id) {
          this.selectedConsultation = updatedConsultation;
        }

        if (consultation.id != null) {
          this.editableFollowUpDates[consultation.id] = this.toDateTimeLocal(updatedConsultation.followUpDate);
        }

        this.initializeCalendar();
        this.success = 'Consultation updated successfully';
        setTimeout(() => (this.success = null), 3000);
      },
      error: (error) => {
        this.error = 'Failed to update consultation';
        console.error('Error:', error);
      },
      complete: () => {
        this.updatingStatusId = null;
      }
    });
  }

  deleteConsultation(id: number | undefined): void {
    if (id == null) {
      return;
    }

    if (!confirm('Are you sure you want to delete this consultation?')) {
      return;
    }

    this.error = null;
    this.success = null;

    this.clinicalService.deleteConsultation(id).subscribe({
      next: () => {
        this.consultations = this.consultations.filter((item) => item.id !== id);
        delete this.editableFollowUpDates[id];

        if (this.selectedConsultation?.id === id) {
          this.closeModal();
        }

        this.initializeCalendar();
        this.success = 'Consultation deleted successfully';
        setTimeout(() => (this.success = null), 3000);
      },
      error: (error) => {
        this.error = 'Failed to delete consultation';
        console.error('Error:', error);
      }
    });
  }

  getColorByStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'no_show':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  private toDateTimeLocal(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
