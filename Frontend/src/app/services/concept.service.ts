import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class ConceptService {

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

  getConcepts(){
    return this.http.get(`${this.baseUrl}/concepto`);
  } 

  getTypeConcepts(){
    return this.http.get(`${this.baseUrl}/tipoconcepto`);
  }

  getNatureConcepts(){
    return this.http.get(`${this.baseUrl}/naturalezaconcepto`);
  }

  async insert(pConcept:any):Promise<any>{
    let urlInsertConcept = `${this.baseUrl}/concepto/agregarConcepto`;
    return this.http.post<any>(urlInsertConcept,pConcept,this.HttpOptions).toPromise();
  }

  async update(pConcept:any):Promise<any>{
    let urlUpdateConcept = `${this.baseUrl}/concepto/actualizarConcepto`;
    return this.http.post<any>(urlUpdateConcept,pConcept,this.HttpOptions).toPromise();
  }

  async updateState(pConcept:any):Promise<any>{
    let urlUpdateConcept = `${this.baseUrl}/concepto/actualizarEstado`;
    return this.http.post<any>(urlUpdateConcept,pConcept,this.HttpOptions).toPromise();
  }
  
  async updateFormats(pForamtos:any):Promise<any>{
    let urlInsertConcept = `${this.baseUrl}/concepto/actualizarFormatos`;
    return this.http.post<any>(urlInsertConcept,pForamtos,this.HttpOptions).toPromise();
  }

  async saveForms(pForamtos:any):Promise<any>{
    let urlInsertConcept = `${this.baseUrl}/concepto/añadirformatos`;
    return this.http.post<any>(urlInsertConcept,pForamtos,this.HttpOptions).toPromise();
  }
}
