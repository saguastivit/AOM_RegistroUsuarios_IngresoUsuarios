import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = global.urlBack ; 

  private  HttpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  usuarioSession : any = { };  

  constructor(private http: HttpClient, private router: Router ) {
    let session = localStorage.getItem('sessionUser');
    
    if (session != null){
      this.usuarioSession = JSON.parse(session); 
    }else{
      this.router.navigate(['Login']);  
    }
  }  

  async getBusiness():Promise<any>{
    let urlgetBusiness = `${this.baseUrl}/empresa`;
    return this.http.get<any>(urlgetBusiness).toPromise();
  }

  async syncBusiness():Promise<any>{
    let urlgetBusiness = `${this.baseUrl}/empresasOracle`;
    return this.http.get<any>(urlgetBusiness).toPromise();
  }

  

  async update(pCompany:any):Promise<any>{
    let urlUpdateCompany = `${this.baseUrl}/empresa/actualizarEmpresa`;
    return this.http.post<any>(urlUpdateCompany,pCompany,this.HttpOptions).toPromise();
  }    

  async insert(pCompany:any):Promise<any>{
    let urlInsertContacts = `${this.baseUrl}/empresa/agregarEmpresa`;
    return this.http.post<any>(urlInsertContacts,pCompany,this.HttpOptions).toPromise();
  }

  async updateActivities(pActivities:any):Promise<any>{
    let urlInsertContacts = `${this.baseUrl}/empresa/actualizarActividates`;
    return this.http.post<any>(urlInsertContacts,pActivities,this.HttpOptions).toPromise();
  }

  async saveActivities(pActivities:any):Promise<any>{
    let urlInsertContacts = `${this.baseUrl}/empresa/añadirActividates`;
    return this.http.post<any>(urlInsertContacts,pActivities,this.HttpOptions).toPromise();
  }

}
