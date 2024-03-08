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
  providedIn: 'root',
})
export class RegisterApiService {
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

  public postDataBasic(data: any): Observable<any> {
    this._formDataService.setLoading(true);

    return this._http
      .post<any>(
        `${this.apiUrl}/${environment.apiRegisterBasic}`,
        data,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }

  public postDataContacto(data: any): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .post<any>(
        `${this.apiUrl}/${environment.apiRegisterSolicitante}`,
        data,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }

  public postDataRepresentante(data: any): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .post<any>(
        `${this.apiUrl}/${environment.apiRegisterRepresentante}`,
        data,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }
  public postChangeEstatus(data: any): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .post<any>(
        `${this.apiUrl}/${environment.apiChangeEstatus}`,
        data,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }
  public postAltaEmpresa({ empresaid, userid }: any): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .post<any>(
        `${this.apiUrl}/${environment.apiAltaEmpresa}?solicitudId=${empresaid}&usuarioId=${userid}`,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }

  public validarEmpresa(nit: string): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .get<any>(
        `${this.apiUrl}/ms-registro/validarEmpresa?nit=${nit}`,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }
  public getSolicitudes(): Observable<any> {
    this._formDataService.setLoading(true);
    return this._http
      .get<any>(
        `${this.apiUrl}/ms-registro/solicitudPendiente`,
        this.getHttpOptions()
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => this._formDataService.setLoading(false))
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(errorMessage);
  }
}
