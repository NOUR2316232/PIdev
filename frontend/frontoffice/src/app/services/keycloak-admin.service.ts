import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, catchError, of } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import keycloakConfig from '../keycloak.config';

export interface KeycloakUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class KeycloakAdminService {

  private readonly adminBaseUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}`;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  /**
   * Get users that have a specific realm role.
   * Uses the current user's Bearer token — make sure the logged-in user
   * has the "view-users" role in realm-management, or use a dedicated service account.
   */
  getUsersByRole(roleName: string): Observable<KeycloakUser[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.get<KeycloakUser[]>(
          `${this.adminBaseUrl}/roles/${roleName}/users?max=200`,
          { headers }
        );
      }),
      catchError(err => {
        console.error(`Failed to load users with role "${roleName}"`, err);
        return of([]);
      })
    );
  }

  /** Helper: returns display name for a KeycloakUser */
  static displayName(user: KeycloakUser): string {
    const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return full || user.username;
  }
}