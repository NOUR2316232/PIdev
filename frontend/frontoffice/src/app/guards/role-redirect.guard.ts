import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root',
})
export class RoleRedirectGuard implements CanActivate {
    constructor(private keycloak: KeycloakService, private router: Router) {}

    async canActivate(): Promise<boolean> {
        const userRoles = await this.keycloak.getUserRoles();

        // Doctor stays in Front office
        if (userRoles.includes('doctor')) {
            return true;
        }

        // Admin redirects to Back office
        if (userRoles.includes('admin')) {
            window.location.href = 'http://localhost:4369/'; // Adjust port if needed
            return false;
        }

        // If no valid role, logout and redirect to Keycloak login
        await this.keycloak.logout();
        return false;
    }
}
