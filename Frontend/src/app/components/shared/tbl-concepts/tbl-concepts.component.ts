import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConceptService } from '../../../services/concept.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tbl-concepts',
  templateUrl: './tbl-concepts.component.html'
})
export class TblConceptsComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef; 

  // concepto a modificar
  conceptChangeState: any = { };
  
  // mensaje confirmacion actualizacion de estado empresas
  estateConcept = '';  
  
  // corinilla cargando
  load : boolean = false ;
  
  // session
  user: any = { };
  
  // variables de entrada y salida
  @Input() concepts: any = [];
  @Output() idSelected = new EventEmitter<any>();

  // opcion tablas  
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  constructor(private modal: BsModalService,
              private conceptService: ConceptService,
              private toastr: ToastrService) { 
              this.idSelected = new EventEmitter();
              this.loadSession();
              this.dtOptions = {
                pagingType: 'full_numbers',
                lengthMenu: [ 10, 15, 20, 25, 30 ],
                pageLength: 10,
                language: {
                  lengthMenu: "Mostrar _MENU_ registros",
                  info: "Mostrar _PAGE_ de _PAGES_",
                  search: "Buscar en la grilla:",
                  paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                  }
                }     
              };
  }

  // trae la sesion
  loadSession(){    
    let session = localStorage.getItem('sessionUser');
    if (session != null) {
      this.user = JSON.parse(session);  
    }
  }

  // emite el id del item seleccionado
  conceptSelected(id_concepto: any){
    this.idSelected.emit(id_concepto);
  }

  // cambia el estado de una empresa
  changeState(check: any, template: TemplateRef<any>){    
    console.log(check.path[0].checked);      
    this.conceptChangeState = this.concepts.find((element: { id_concepto: any; }) => element.id_concepto == check.target.id);    
    this.conceptChangeState.activo = !this.conceptChangeState.activo ;
    let estado1 = !check.path[0].checked ? 'activo' : 'inactivo';    
    let estado2 = check.path[0].checked ? 'activo' : 'inactivo';    
    this.estateConcept = `Esta seguro de cambiar el estado de ${estado1} a ${estado2} para el concepto ${this.conceptChangeState.cod_concepto}`;      
    this.openModal(template);
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  // refresca el estado que no se modifico
  refreshState(){  
    this.conceptChangeState.activo = !this.conceptChangeState.activo ;  
  }

   // actualiza el estado de una empresa
   async updateState(){  
     debugger;
    this.load = true;  
    this.conceptChangeState.usuario_actualizacion = this.user.id_user ;

    let serviceResponse = await this.conceptService.updateState(this.conceptChangeState);
    
    if (serviceResponse == "ok") {
      this.toastr.success('Estado actualizado', '', {
        timeOut: 3000,
      });
    }else{
      this.toastr.error('No se pudo actualizar', '', {
        timeOut: 3000,
      });
    } 
    this.load = false;
  }
}
