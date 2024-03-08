import { Component, OnInit, TemplateRef } from '@angular/core';
import { RegisterApiService } from '../services/register-api.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Observer } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.css'],
})
export class TableDetailsComponent implements OnInit {
  data: any[] = [];
  modalRef?: BsModalRef;
  modalRef2?: BsModalRef;
  selectedItem: any;
  selectedStatus: string = '';
  pageSize: number = 10; // Cantidad de elementos por página
  currentPage: number = 1; // Página actual
  paginatedData: any[] = []; // Array para almacenar la data paginada
  errorMessage?: string;
  rechazoMotive?: string;

  sessionUserString = localStorage.getItem('sessionUser');
  sessionUser = this.sessionUserString
    ? JSON.parse(this.sessionUserString)
    : null;
  idUser = this.sessionUser?.usuarioId || undefined;

  paginateData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.data.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  pageChanged(event: PageChangedEvent) {
    this.currentPage = event.page;
    this.paginateData();
  }

  constructor(
    private registerApiService: RegisterApiService,
    private modalService: BsModalService
  ) {
    this.getSolicitudes();
  }

  getSolicitudes() {
    this.registerApiService.getSolicitudes().subscribe({
      next: (data) => {
        // Filtra la data según el estado seleccionado
        if (this.selectedStatus) {
          this.data = data.filter(
            (item: any) => item.estado === this.selectedStatus
          );
        } else {
          this.data = data;
        }

        // Inicializa la paginación
        this.paginateData();
      },
      error(err) {
        alert(err);
      },
    });
  }

  getSolicitudesByStatus() {
    this.getSolicitudes();
    this.paginateData();
  }

  openModal(template: TemplateRef<void>, item: any) {
    // Asigna el ítem seleccionado antes de mostrar el modal
    this.selectedItem = item;
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'modal-lg',
    });
  }

  openModal2(template: TemplateRef<void>) {
    this.modalRef2 = this.modalService.show(template, {
      id: 2,
      class: 'second',
    });
    this.closeModal(1);
  }

  getObjectKeys(obj: any): { key: string; value: any }[] {
    return Object.keys(obj).map((key) => ({ key, value: obj[key] }));
  }

  altaEmpresa(id: string) {
    this.registerApiService
      .postAltaEmpresa({
        empresaid: id,
        userid: this.idUser,
      })
      .subscribe();
  }

  closeModal(modalId?: number) {
    this.modalService.hide(modalId);
  }

  approveSolicitud(item: any): void {
    const body = {
      solicitudId: item.solicitudId,
      estado: 'APROBADO',
      creadoPor: '',
      observaciones: '',
    };
    this.registerApiService.postChangeEstatus(body).subscribe({
      next: (data: any) => {
        this.getSolicitudesByStatus();
        this.altaEmpresa(item.solicitudId);
      },
      error: (error: any) => {
        this.errorMessage =
          'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.';
      },
    });
    item.showDetails = true;
    this.modalRef?.hide();
  }

  rejectSolicitud(itme: any) {
    const body = {
      solicitudId: itme.solicitudId,
      estado: 'RECHAZADO',
      creadoPor: '',
      observaciones: this.rechazoMotive,
    };
    this.registerApiService.postChangeEstatus(body).subscribe();
    this.closeModal(2);
  }

  ngOnInit() {
    // Inicializa Bootstrap Table
    $('#table').bootstrapTable();
  }
}
