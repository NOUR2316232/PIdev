import { Component, OnInit } from '@angular/core';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';
import { UserService } from '../../../../services/user.service';
import { KeycloakService } from 'keycloak-angular';

import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
    selector: 'app-user-meta-card',
    imports: [
        ModalComponent,
        InputFieldComponent,
        ButtonComponent
    ],
    templateUrl: './user-meta-card.component.html',
    standalone: true,
    styles: ``
})
export class UserMetaCardComponent implements OnInit {

  constructor(
    public modal: ModalService,
    private userService: UserService,
    private keycloakService: KeycloakService
  ) {}

  isOpen = false;
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  user = {
    firstName: '',
    lastName: '',
    role: 'User',
    location: 'N/A',
    avatar: '/images/user/owner.jpg',
    social: {
      facebook: '#',
      x: '#',
      linkedin: '#',
      instagram: '#',
    },
    email: '',
    phone: 'N/A',
    bio: 'N/A',
  };

  async ngOnInit(): Promise<void> {
    try {
      const [profile, keycloakProfile] = await Promise.all([
        this.userService.getProfile(),
        this.keycloakService.loadUserProfile()
      ]);

      this.user.firstName = keycloakProfile.firstName ?? '';
      this.user.lastName = keycloakProfile.lastName ?? '';
      this.user.email = profile?.email ?? keycloakProfile.email ?? '';
      this.user.role = profile?.role ? String(profile.role) : 'User';
      this.user.bio = this.user.role;
    } catch (error) {
      console.error('Failed to load user meta profile', error);
      try {
        const keycloakProfile = await this.keycloakService.loadUserProfile();
        this.user.firstName = keycloakProfile.firstName ?? '';
        this.user.lastName = keycloakProfile.lastName ?? '';
        this.user.email = keycloakProfile.email ?? '';
      } catch (fallbackError) {
        console.error('Failed to load Keycloak profile fallback', fallbackError);
      }
    }
  }

  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
