import { Component, OnInit } from '@angular/core';
import { StepStateService } from 'src/app/services/step-state.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  activeStep: string = 'basico';
  responseId?: number;
  representanteLegal?: boolean;

  constructor(private _stepStateService: StepStateService) {}

  ngOnInit(): void {
    this._stepStateService.activeStep$.subscribe((step) => {
      this.activeStep = step;
    });

    this._stepStateService
      .getEsRepresentanteLegal()
      .subscribe((esRepresentanteLegal) => {
        this.representanteLegal = esRepresentanteLegal ?? false;
      });
  }
}
