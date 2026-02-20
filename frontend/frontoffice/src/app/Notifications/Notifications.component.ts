import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { NotificationService, CriticalNotification } from '../services/Notification.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notifications: CriticalNotification[] = [];
  filterType: 'all' | 'critical' | 'warning' | 'unread' = 'all';
  isDoctor = false;

  private sub?: Subscription;

  constructor(
    public notifService: NotificationService,
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if the logged-in user has the 'doctor' role
    this.isDoctor = this.keycloakService.isUserInRole('doctor');

    if (!this.isDoctor) {
      // Non-doctor users see no notifications — stop here
      return;
    }

    this.sub = this.notifService.notifications.subscribe(notifs => {
      this.notifications = notifs;
    });

    // Mark all as read when opening the page
    this.notifService.markAllRead();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get filtered(): CriticalNotification[] {
    if (!this.isDoctor) return [];

    switch (this.filterType) {
      case 'critical': return this.notifications.filter(n => n.severity === 'critical');
      case 'warning':  return this.notifications.filter(n => n.severity === 'warning');
      case 'unread':   return this.notifications.filter(n => !n.read);
      default:         return this.notifications;
    }
  }

  get criticalCount(): number {
    return this.notifications.filter(n => n.severity === 'critical').length;
  }

  get warningCount(): number {
    return this.notifications.filter(n => n.severity === 'warning').length;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  acknowledge(id: string): void {
    this.notifService.acknowledge(id);
  }

  goToPatient(hospitalizationId: number): void {
    this.router.navigate(['/hospitalization'], {
      queryParams: { highlight: hospitalizationId }
    });
  }

  clearAll(): void {
    if (confirm('Clear all notifications?')) {
      this.notifService.clearAll();
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'temperature':      return 'bi-thermometer-half';
      case 'heartRate':        return 'bi-heart-pulse-fill';
      case 'oxygenSaturation': return 'bi-lungs-fill';
      case 'respiratoryRate':  return 'bi-wind';
      default:                 return 'bi-exclamation-triangle-fill';
    }
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return 'just now';
  }
}