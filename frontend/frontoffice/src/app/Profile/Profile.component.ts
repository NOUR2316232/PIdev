import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import keycloakConfig from '../keycloak.config';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './Profile.component.html',
  styleUrls: ['./Profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = null;
  userId: string | null = null;
  roles: string[] = [];

  loading       = true;
  activeTab: 'info' | 'password' | 'security' = 'info';

  verifyMsg:    { type: 'success' | 'error'; text: string } | null = null;
  sendingVerify = false;

  private readonly adminBase = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}`;

  // URL to Keycloak's built-in Account Console — works on ALL Keycloak versions,
  // requires zero extra permissions, handles current-password verification natively.
  readonly keycloakAccountUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account/`;
  readonly keycloakPasswordUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account/#/security/signingin`;

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.profile = await this.keycloakService.loadUserProfile();
      this.userId  = this.profile.id ?? null;

      const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed as any;
      const allRoles: string[] = tokenParsed?.realm_access?.roles ?? [];
      this.roles = allRoles.filter(r =>
        !['offline_access', 'uma_authorization', `default-roles-${keycloakConfig.realm}`].includes(r)
      );
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  get initials(): string {
    const first = this.profile?.firstName?.[0] ?? '';
    const last  = this.profile?.lastName?.[0]  ?? '';
    return (first + last).toUpperCase() || this.profile?.username?.[0]?.toUpperCase() || '?';
  }

  get fullName(): string {
    const name = `${this.profile?.firstName ?? ''} ${this.profile?.lastName ?? ''}`.trim();
    return name || this.profile?.username || 'User';
  }

  get emailVerified(): boolean {
    return this.profile?.emailVerified ?? false;
  }

  get primaryRole(): string {
    if (!this.roles.length) return 'User';
    return this.roles[0].charAt(0).toUpperCase() + this.roles[0].slice(1);
  }

  // ── Open Keycloak Account Console ─────────────────────────────────────────
  // Redirects the user to Keycloak's native password-change page.
  // This works on every Keycloak version without any API permission.
  openPasswordChange(): void {
    window.open(this.keycloakPasswordUrl, '_blank', 'noopener');
  }

  // ── Send email verification via Keycloak Admin API ────────────────────────
  sendVerificationEmail(): void {
    if (!this.userId) return;

    this.sendingVerify = true;
    this.verifyMsg     = null;

    from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json'
        });
        return this.http.put(
          `${this.adminBase}/users/${this.userId}/execute-actions-email`,
          ['VERIFY_EMAIL'],
          { headers }
        );
      })
    ).subscribe({
      next: () => {
        this.verifyMsg     = { type: 'success', text: 'Verification email sent! Please check your inbox.' };
        this.sendingVerify = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Email verification failed', err);
        this.verifyMsg     = { type: 'error', text: 'Failed to send verification email. Contact your administrator.' };
        this.sendingVerify = false;
        this.cdr.detectChanges();
      }
    });
  }

  dismissVerifyMsg(): void { this.verifyMsg = null; }
}