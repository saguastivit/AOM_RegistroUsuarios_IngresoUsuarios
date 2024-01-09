import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as global from 'src/global';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

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

  getUsers(){
    return this.http.get(`${this.baseUrl}/user/getAll`);
  }

  getRols(){
    return this.http.get(`${this.baseUrl}/role/getAll`);
  }

  async insert(pUser:any):Promise<any>{
    let urlInsertUser = `${this.baseUrl}/user/agregarUser`;
    return this.http.post<any>(urlInsertUser,pUser,this.HttpOptions).toPromise();
  }

  async update(pUser:any):Promise<any>{
    let urlUpdateUser = `${this.baseUrl}/user/actualizarUser`;
    return this.http.post<any>(urlUpdateUser,pUser,this.HttpOptions).toPromise();
  }  

  async updateState(pUser:any):Promise<any>{
    let urlUpdateUser = `${this.baseUrl}/user/actualizarEstado`;
    return this.http.post<any>(urlUpdateUser,pUser,this.HttpOptions).toPromise();
  }

}
