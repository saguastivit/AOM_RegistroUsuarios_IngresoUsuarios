import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as global from 'src/global'


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
   private baseUrl = global.urlBack ;  

  usuarioSession : any = { };

  constructor(private http: HttpClient, private router: Router ) {
    let session = localStorage.getItem('sessionUser');
    
    if (session != null){
      this.usuarioSession = JSON.parse(session); 
    }else{
      this.router.navigate(['Login']);  
    }
   }

  upload(file: File): Observable<HttpEvent<any>> {

    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }


  uploadFiles(files: File[], idempresa: string): Observable<HttpEvent<any>>{
    let formData: FormData = new FormData();

    for (var i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }    

    formData.append("empresa", idempresa);
    formData.append("user", String(this.usuarioSession.id_user));

    const req = new HttpRequest('POST', `${this.baseUrl}/upload/PostFormData`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);

  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }

  // valida si los formatos se pueden o no cargar
  validateHistory(formats: any){
    return this.http.post<any>(`${this.baseUrl}/Upload/ValidarHistorial`, formats);
  }

  // tslint:disable-next-line: typedef
  getBusiness(){
    return this.http.get(`${this.baseUrl}/empresa`);
  }

  // tslint:disable-next-line: typedef
  getFormatsByCompany(id: number){
    return this.http.get(`${this.baseUrl}/Upload/formatosEmpresa?id=${id}`);
  }
}
