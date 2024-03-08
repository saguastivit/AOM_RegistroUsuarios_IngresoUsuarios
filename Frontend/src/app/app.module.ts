import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';

// componentes
import { AppComponent } from './app.component';

import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { HeaderComponent } from './components//shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';

// rutas
import { APP_ROUTING } from './app-routes';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { SearchDirective } from './directives/search.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyComponent } from './components/company/company.component';
import { ConceptComponent } from './components/concept/concept.component';
import { CostComponent } from './components/cost/cost.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { TblBussinesComponent } from './components/shared/tbl-bussines/tbl-bussines.component';
import { InfoBussinesComponent } from './components/shared/info-bussines/info-bussines.component';
import { TblConceptsComponent } from './components/shared/tbl-concepts/tbl-concepts.component';
import { InfoConceptsComponent } from './components/shared/info-concepts/info-concepts.component';
import { TblEdcComponent } from './components/shared/tbl-edc/tbl-edc.component';
import { InfoEdcComponent } from './components/shared/info-edc/info-edc.component';
import { FormatsComponent } from './components/formats/formats.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { UsersComponent } from './components/users/users.component';
import { InfoActivitiesComponent } from './components/shared/info-activities/info-activities.component';
import { InfoFormatsComponent } from './components/shared/info-formats/info-formats.component';
import { TblFormatsComponent } from './components/shared/tbl-formats/tbl-formats.component';
import { TblActivitiesComponent } from './components/shared/tbl-activities/tbl-activities.component';

import { InfoUsersComponent } from './components/shared/info-users/info-users.component';
import { TblUsersComponent } from './components/shared/tbl-users/tbl-users.component';

//register
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TableDetailsComponent } from './table-details/table-details.component';
import { RegisterComponent } from './auth/register/register.component';
import { FormInfoBasicComponent } from './auth/register/form-info-basic/form-info-basic.component';
import { FormDatosContactoComponent } from './auth/register/form-datos-contacto/form-datos-contacto.component';
import { FormRepresentanteLegalComponent } from './auth/register/form-representante-legal/form-representante-legal.component';
import { SuccessModalComponent } from './constants/success-modal/success-modal.component';
import { LoginComponent } from './auth/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    FileUploadComponent,
    SearchDirective,
    CompanyComponent,
    ConceptComponent,
    CostComponent,
    NavbarComponent,
    TblBussinesComponent,
    InfoBussinesComponent,
    TblConceptsComponent,
    InfoConceptsComponent,
    TblEdcComponent,
    InfoEdcComponent,
    FormatsComponent,
    ActivitiesComponent,
    InfoActivitiesComponent,
    InfoFormatsComponent,
    TblFormatsComponent,
    TblActivitiesComponent,
    UsersComponent,
    InfoUsersComponent,
    TblUsersComponent,
    //aqui lo nuevo de registro

    RegisterComponent,
    FormInfoBasicComponent,
    FormDatosContactoComponent,
    FormRepresentanteLegalComponent,
    TableDetailsComponent,
    SuccessModalComponent,
  ],
  imports: [
    APP_ROUTING,
    FormsModule,
    CommonModule,
    BrowserModule,
    HttpClientModule,
    NgMultiSelectDropDownModule.forRoot(),
    BrowserAnimationsModule,
    DataTablesModule,
    ToastrModule.forRoot(),
    OAuthModule.forRoot(),
    ModalModule.forRoot(),
    NgbModule,
    AppRoutingModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
  ],
  providers: [OAuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
