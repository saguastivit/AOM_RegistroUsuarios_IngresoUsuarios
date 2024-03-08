import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as global from 'src/global'

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private baseUrl = global.urlBack ;  

  private  HttpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  variable: any;
  empresas = [];

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line: typedef
/*   testConection(){
    return this.http.get(`${this.baseUrl}/values`);
  } */

  // tslint:disable-next-line: typedef
  loginUser(user: any){
    user.pass = btoa(user.pass);    
    return this.http.post<any>(`${this.baseUrl}/User/Login`, user);
  }

  
  // recuperar contraseña.............................................................
  updatePassword(userRecover: any){
    userRecover.pass = btoa(userRecover.pass);
    userRecover.confpass = btoa(userRecover.confpass);
    return this.http.post<any>(`${this.baseUrl}/User/updatePassword`, userRecover);
  }

  recoverPassword(userRecover: any){
    return this.http.post<string>(`${this.baseUrl}/User/recoverPassword`, userRecover, this.HttpOptions);
  }
}
