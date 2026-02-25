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

        // Admin stays in Back office
        if (userRoles.includes('admin')) {
            return true;
        }

        // Doctor redirects to Front office
        if (userRoles.includes('doctor')) {
            window.location.href = 'http://localhost:4200/'; // Adjust port if needed
            return false;
        }

        // If no valid role, logout and redirect to Keycloak login
        await this.keycloak.logout();
        return false;
    }
}
