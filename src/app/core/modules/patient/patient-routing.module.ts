import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientAppointmentComponent } from './components/patient-appointment/patient-appointment.component';
import { PatientComponent } from './components/patient.component';
import { PatientDashboardComponent } from './components/patient-dashboard/patient-dashboard.component';
import { PatientDetailsComponent } from './components/patient-dashboard/patient-details/patient-details.component';
import { PatientCurrentComponent } from './components/patient-dashboard/patient-current/patient-current.component';
import { PatientHistoryComponent } from './components/patient-dashboard/patient-history/patient-history.component';

const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: PatientDashboardComponent,
    children: [
      {
        path: 'details',
        component: PatientDetailsComponent,
      },
      {
        path: 'current',
        component: PatientCurrentComponent,
      },
      {
        path: 'history',
        component: PatientHistoryComponent,
      },
    ],
  },
  {
    path: 'appointment',
    component: PatientAppointmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
