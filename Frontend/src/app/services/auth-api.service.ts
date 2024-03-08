import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FormDataServiceService } from './form-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiUrl?: string = environment.apiUrl;

  constructor(
    private _http: HttpClient,
    private _formDataService: FormDataServiceService
  ) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  login(correo: string, contrasenia: string): Observable<any> {
    const url = `${this.apiUrl}/${environment.login}?correo=${correo}&contrasenia=${contrasenia}`;
    return this._http.get(url, this.getHttpOptions());
  }
}
