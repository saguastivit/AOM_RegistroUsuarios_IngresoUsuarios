import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Observer } from 'rxjs';
import { SuccessModalComponent } from '../constants/success-modal/success-modal.component';

@Injectable({
  providedIn: 'root',
})
export class MensajeService {
  bsModalRef!: BsModalRef;

  constructor(private bsModalService: BsModalService) {}

  alerta(message: string): Observable<string> {
    const initialState = {
      message,
    };

    this.bsModalRef = this.bsModalService.show(SuccessModalComponent, {
      initialState,
    });

    return new Observable<string>((observer: Observer<string>) => {
      const subscription = this.bsModalService.onHidden.subscribe(
        (reason: string) => {
          observer.complete();
        }
      );

      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    });
  }
}
