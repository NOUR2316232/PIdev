import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { RoleGuard } from './guards/role.guard';
import {HospitalizationComponent} from "./pages/dashboard/hospitalization/hospitalization.component";
import { StatistiqueHospitalizationComponent } from './pages/statistique/statistique-hospitalization.component';
export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [RoleGuard], // 🔒 Protect the whole back office
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Dashboard | Back Office',
      },
      { path: 'calendar', component: CalenderComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'form-elements', component: FormElementsComponent },
      { path: 'basic-tables', component: BasicTablesComponent },
      { path: 'blank', component: BlankComponent },
      { path: 'invoice', component: InvoicesComponent },
      { path: 'line-chart', component: LineChartComponent },
      { path: 'bar-chart', component: BarChartComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'avatars', component: AvatarElementComponent },
      { path: 'badge', component: BadgesComponent },
      { path: 'buttons', component: ButtonsComponent },
      { path: 'images', component: ImagesComponent },
      { path: 'videos', component: VideosComponent },
      // Back office modules
      /*{ path: 'pharmacy', component: PharmacyComponent },
      { path: 'diagnosis', component: DiagnosisComponent },*/
      { path: 'hospitalization', component: HospitalizationComponent },
      { path: 'statistique-hospitalization', component: StatistiqueHospitalizationComponent },
    ],
  },
  // Public/Error Pages
  {
    path: '**',
    component: NotFoundComponent,
  },
];
