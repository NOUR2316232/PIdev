import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/Notification.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  username: string      = '';
  userEmail: string     = '';
  userFirstName: string = '';
  userLastName: string  = '';
  userRoles: string[]   = [];
  dropdownOpen: boolean  = false;
  scrolled: boolean      = false;
  unreadCount: number    = 0;
  hasCritical: boolean   = false;

  private notifSub?: Subscription;

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    public notifService: NotificationService
  ) {}

  ngOnInit() {
    const token: any = this.keycloakService.getKeycloakInstance().tokenParsed;
    if (token) {
      this.username      = token['preferred_username'] || '';
      this.userFirstName = token['given_name']         || '';
      this.userLastName  = token['family_name']        || '';
      this.userEmail     = token['email']              || '';
      this.userRoles     = this.keycloakService.getUserRoles();
    }

    this.notifSub = this.notifService.notifications.subscribe(notifs => {
      this.unreadCount = notifs.filter(n => !n.read).length;
      this.hasCritical = notifs.some(n => !n.read && n.severity === 'critical');
    });
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrap')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getInitials(): string {
    const f = this.userFirstName?.[0] || '';
    const l = this.userLastName?.[0]  || '';
    return (f + l).toUpperCase() || this.username?.[0]?.toUpperCase() || 'U';
  }

  getFullName(): string {
    const full = `${this.userFirstName} ${this.userLastName}`.trim();
    return full || this.username || 'User';
  }

  getPrimaryRole(): string {
    const ignored = ['offline_access', 'uma_authorization', 'default-roles-nephro-realm'];
    const role = this.userRoles.find(r => !ignored.includes(r));
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Patient';
  }

  goToNotifications() {
    this.dropdownOpen = false;
    this.router.navigate(['/notifications']);
  }

  goTo(path: string) {
    this.dropdownOpen = false;
    this.router.navigate([path]);
  }

  logout() {
    this.keycloakService.logout('http://localhost:4200');
  }
}