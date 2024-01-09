import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
  providers: [DatePipe]
})
export class NavbarComponent  {

  constructor(private router: Router,private datePipe: DatePipe) {
    this.loadApp();
  }
  
  session: any;
  usuarioSession: any = { };

  // fecha actual
  dateNow = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
  myDate : any; 

  
  loadApp(){    
    this.session = localStorage.getItem('sessionUser');

    if (this.session != null){
        this.usuarioSession = JSON.parse(this.session); 
        this.myDate = moment(this.dateNow); 
    }else{
        this.router.navigate(['Login']);  
    }
  }

  logout(){
    localStorage.clear();    
    sessionStorage.clear();
    this.router.navigate(['']);   
  }
  

}
