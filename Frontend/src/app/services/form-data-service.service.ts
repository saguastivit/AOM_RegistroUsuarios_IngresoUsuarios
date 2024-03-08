import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormDataServiceService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  setLoading(value: boolean): void {
    this.loadingSubject.next(value);
  }

  private formData: { [key: string]: any } = {};

  setFormData(formName: string, data: any): void {
    this.formData[formName] = data;
  }

  getFormData(formName: string): any {
    return this.formData[formName];
  }
}
