import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

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

  getFormats(){
    return this.http.get(`${this.baseUrl}/formato`);
  }

  async insert(pFormat:any):Promise<any>{
    let urlInsertFormat = `${this.baseUrl}/formato/agregarFormato`;
    return this.http.post<any>(urlInsertFormat,pFormat,this.HttpOptions).toPromise();
  }

  async update(pFormat:any):Promise<any>{
    let urlUpdateFormat = `${this.baseUrl}/formato/actualizarFormato`;
    return this.http.post<any>(urlUpdateFormat,pFormat,this.HttpOptions).toPromise();
  }  

  async updateState(pFormat:any):Promise<any>{
    let urlUpdateFormat = `${this.baseUrl}/formato/actualizarEstado`;
    return this.http.post<any>(urlUpdateFormat,pFormat,this.HttpOptions).toPromise();
  }
}
