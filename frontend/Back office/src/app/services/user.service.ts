import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8069/api/users';

  constructor(private http: HttpClient, private keycloak: KeycloakService) {}

  async getProfile(): Promise<any> {
    const token = await this.keycloak.getToken();

    return firstValueFrom(
      this.http.get(`${this.apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    );
  }
}
