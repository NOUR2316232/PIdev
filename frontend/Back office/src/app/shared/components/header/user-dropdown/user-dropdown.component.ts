import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent],
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  username: string = '';

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed as Record<string, any>;
    this.username = tokenParsed['preferred_username'] || 'User';
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {
    this.keycloakService.logout();
  }

  register() {
    this.keycloakService.register();
  }
}
