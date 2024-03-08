import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CompanyComponent } from './components/company/company.component';
import { ConceptComponent } from './components/concept/concept.component';
import { CostComponent } from './components/cost/cost.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { FormatsComponent } from './components/formats/formats.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { UsersComponent } from './components/users/users.component';
import { TableDetailsComponent } from './table-details/table-details.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';

const ROUTES: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'files', component: FileUploadComponent },
  { path: 'formatos', component: FormatsComponent },
  { path: 'empresas', component: CompanyComponent },
  { path: 'conceptos', component: ConceptComponent },
  { path: 'actividades', component: ActivitiesComponent },
  { path: 'usuarios', component: UsersComponent },
  { path: 'cambiarCredencial', component: ChangePasswordComponent },
  { path: 'cambiarCredencial/:user', component: ChangePasswordComponent },
  { path: 'edc', component: CostComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'solicitud', component: TableDetailsComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES, { useHash: true });
