import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type DashboardModule = {
  name: string;
  description: string;
  route: string;
  status: 'active' | 'monitoring';
};

type RoleArea = {
  role: string;
  responsibilities: string;
};

@Component({
  selector: 'app-ecommerce',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent {
  readonly today = new Date();

  readonly projectModules: DashboardModule[] = [
    {
      name: 'Clinical Service',
      description: 'Consultations, medical histories, triage queue and doctor assignment flows.',
      route: '/clinical',
      status: 'active'
    },
    {
      name: 'Hospitalization Service',
      description: 'In-patient records, room follow-up, vitals and doctor workload statistics.',
      route: '/hospitalization',
      status: 'active'
    },
    {
      name: 'Consultations Calendar',
      description: 'Operational schedule view for patient and doctor consultation planning.',
      route: '/consultations-calendar',
      status: 'active'
    },
    {
      name: 'Hospitalization Analytics',
      description: 'Occupancy, trends and service-level indicators for inpatient monitoring.',
      route: '/statistique-hospitalization',
      status: 'monitoring'
    },
    {
      name: 'Dialysis Module',
      description: 'Treatment plan/session execution and patient dialysis lifecycle follow-up.',
      route: '/calendar',
      status: 'monitoring'
    },
    {
      name: 'User & Access',
      description: 'Role-based access via Keycloak, profile controls and operational security.',
      route: '/profile',
      status: 'active'
    }
  ];

  readonly roleAreas: RoleArea[] = [
    { role: 'Doctor', responsibilities: 'Diagnosis, triage care start, and consultation decisions.' },
    { role: 'Nurse', responsibilities: 'Vital signs tracking and inpatient follow-up operations.' },
    { role: 'Pharmacist', responsibilities: 'Prescription flow and medication validation pipeline.' },
    { role: 'Lab / Radiology', responsibilities: 'Diagnostic result entry and imaging/lab workflows.' },
    { role: 'Admin', responsibilities: 'System governance, account lifecycle, and module supervision.' }
  ];
}
