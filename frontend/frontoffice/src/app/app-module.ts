import { NgModule,  APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import keycloakConfig from './keycloak.config';
import { DiagnosticComponent } from './diagnostic/diagnostic.component';
import { HospitalizationComponent } from './hospitalization/hospitalization.component';
import { NotificationsComponent } from './Notifications/Notifications.component';
import { ProfileComponent } from './Profile/Profile.component';


function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      },
    });
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    DiagnosticComponent,
    HospitalizationComponent,
    NotificationsComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    KeycloakAngularModule,
    HttpClientModule,
    ReactiveFormsModule

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
