import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class CostService {

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

  getEdc(){
    return this.http.get(`${this.baseUrl}/edc`);
  }
  
  getEdcFormat(){
    return this.http.get(`${this.baseUrl}/edc/edcFormatos`);
  }

  async insert(pEdc:any):Promise<any>{
    let urlInsertEdc = `${this.baseUrl}/edc/agregarEdc`;
    return this.http.post<any>(urlInsertEdc,pEdc,this.HttpOptions).toPromise();
  }

  async updateFormats(pForamtos:any):Promise<any>{
    let urlInsertConcept = `${this.baseUrl}/edc/actualizarFormatos`;
    return this.http.post<any>(urlInsertConcept,pForamtos,this.HttpOptions).toPromise();
  }

  async saveForms(pForamtos:any):Promise<any>{
    let urlInsertEdc = `${this.baseUrl}/edc/añadirformatos`;
    return this.http.post<any>(urlInsertEdc,pForamtos,this.HttpOptions).toPromise();
  }

  async update(pEdc:any):Promise<any>{
    let urlUpdateEdc = `${this.baseUrl}/edc/actualizarEdc`;
    return this.http.post<any>(urlUpdateEdc,pEdc,this.HttpOptions).toPromise();
  }  
}
