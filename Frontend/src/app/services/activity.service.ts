import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

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

  getServices(){
    return this.http.get(`${this.baseUrl}/Servicio`);
  }

  getActivities(){
    return this.http.get(`${this.baseUrl}/actividad/get`);
  }

  getActivitiesAll(){
    return this.http.get(`${this.baseUrl}/actividad/getall`);
  }

  async insert(pActividad:any):Promise<any>{
    let urlInsertActivity = `${this.baseUrl}/actividad/agregarActividad`;
    return this.http.post<any>(urlInsertActivity,pActividad,this.HttpOptions).toPromise();
  }

  async update(pActividad:any):Promise<any>{
    let urlUpdateActivity = `${this.baseUrl}/actividad/actualizarActividad`;
    return this.http.post<any>(urlUpdateActivity,pActividad,this.HttpOptions).toPromise();
  }  

  async updateState(pActividad:any):Promise<any>{
    let urlUpdateActivity = `${this.baseUrl}/actividad/actualizarEstado`;
    return this.http.post<any>(urlUpdateActivity,pActividad,this.HttpOptions).toPromise();
  }

}
