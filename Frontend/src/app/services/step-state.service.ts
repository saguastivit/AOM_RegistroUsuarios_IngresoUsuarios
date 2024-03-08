// StepStateService
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StepStateService {
  private activeStepSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('basico');   activeStep$: Observable<string> = this.activeStepSubject.asObservable();
    responseId?:number;
    esRepresentanteLegal: boolean  = false;


  getActiveStep(): string {
    return this.activeStepSubject.value

  }

  getIdRegistro():number|undefined{
    return this.responseId
  }

  getEsRepresentanteLegal(): Observable<boolean> {
    return of(this.esRepresentanteLegal);
  }
  setActiveStep(step: string, numb:number|undefined,esRepresentanteLegal: boolean = false): void {
    this.activeStepSubject.next(step);
    this.responseId = numb
    this.esRepresentanteLegal = esRepresentanteLegal;
  }
}
