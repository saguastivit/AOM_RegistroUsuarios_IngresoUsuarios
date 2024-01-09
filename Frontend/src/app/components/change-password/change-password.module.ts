import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangePasswordRoutingModule } from './change-password-routing.module';
import { ChangePasswordComponent } from './change-password.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [       
    ChangePasswordRoutingModule,
    CommonModule,       
    BrowserModule, 
    FormsModule,      
    NgbModule
  ]
})
export class ChangePasswordModule { }
