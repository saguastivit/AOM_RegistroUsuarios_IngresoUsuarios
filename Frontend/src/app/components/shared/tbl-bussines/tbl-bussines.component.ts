import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CompanyService } from '../../../services/company.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-tbl-bussines',
  templateUrl: './tbl-bussines.component.html'
})
export class TblBussinesComponent {
   // modelo de referencia para modales
   modalRef: BsModalRef = new  BsModalRef;  

  // empresa a modificar
  companyChangeState: any = { };
  
  // mensaje confirmacion actualizacion de estado empresas
  estateCompany = '';  

  // corinilla cargando
  load : boolean = false ;

  // session
  user: any = { };

  // variables de entrada y salida
  @Input() businnes: any = [];
  @Output() idSelected = new EventEmitter<any>();
  
   // opcion tablas  
   dtOptions: DataTables.Settings = {};
   dtTrigger = new Subject();
  
  constructor(private modal: BsModalService,
              private companyService: CompanyService,
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
  companySelected(id_empresa: any){
    this.idSelected.emit(id_empresa);
  }

  // cambia el estado de una empresa
  changeState(check: any, template: TemplateRef<any>){    
    this.companyChangeState = this.businnes.find((element: { id_empresa: any; }) => element.id_empresa == check.target.id);    
    this.companyChangeState.activo = !this.companyChangeState.activo ;
    let estado1 = !check.path[0].checked ? 'activo' : 'inactivo';    
    let estado2 = check.path[0].checked ? 'activo' : 'inactivo';    
    this.estateCompany = `Esta seguro de cambiar el estado de ${estado1} a ${estado2} para la empresa ${this.companyChangeState.nombre_empresa }`;      
    this.openModal(template);    
  }

   // muestra una ventana modal
   openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  // refresca el estado que no se modifico
  refreshState(){  
    this.companyChangeState.activo = !this.companyChangeState.activo ;  
  }

  // actualiza el estado de una empresa
  async updateState(){  
    this.load = true;  
    this.companyChangeState.usuario_actualizacion = this.user.id_user ;

    let serviceResponse = await this.companyService.update(this.companyChangeState);
    
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
