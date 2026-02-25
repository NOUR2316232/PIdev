import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { UserService } from '../../../../services/user.service';
import { KeycloakService } from 'keycloak-angular';

import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
    selector: 'app-user-info-card',
    imports: [
        InputFieldComponent,
        ButtonComponent,
        LabelComponent,
        ModalComponent
    ],
    templateUrl: './user-info-card.component.html',
    standalone: true,
    styles: ``
})
export class UserInfoCardComponent implements OnInit {

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
    email: '',
    phone: 'N/A',
    bio: 'N/A',
    social: {
      facebook: '#',
      x: '#',
      linkedin: '#',
      instagram: '#',
    },
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
      this.user.bio = profile?.role ? String(profile.role) : 'User';
    } catch (error) {
      console.error('Failed to load user info profile', error);
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
