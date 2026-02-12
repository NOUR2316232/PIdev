import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {

  username: string = '';

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  async ngOnInit() {
    this.username = await this.keycloakService.getUsername();
  }

  logout() {
    this.keycloakService.logout('http://localhost:4200'); // redirect back to Angular app
  }

  register () {
    this.keycloakService.register();
  }
}
