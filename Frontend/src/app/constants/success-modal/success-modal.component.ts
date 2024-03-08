import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
})
export class SuccessModalComponent implements OnInit {
  message?: string;

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {}

  onClose(): void {
    if (this.bsModalRef) {
      this.bsModalRef.hide();
    }
  }
}