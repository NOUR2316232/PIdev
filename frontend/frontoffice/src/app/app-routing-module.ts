import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth-guard';
import {DiagnosticComponent} from './diagnostic/diagnostic.component';
import {HospitalizationComponent} from './hospitalization/hospitalization.component';
import { NotificationsComponent } from './Notifications/Notifications.component';
import { ProfileComponent } from './Profile/Profile.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'diagnostic',
    component: DiagnosticComponent
  },
  {
    path: 'hospitalization',
    component: HospitalizationComponent
  },
  { path: 'notifications', 
    component: NotificationsComponent 
  },
  { path: 'profile', 
    component: ProfileComponent 
  },
  
  {
    path: '**',
    redirectTo: ''
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
