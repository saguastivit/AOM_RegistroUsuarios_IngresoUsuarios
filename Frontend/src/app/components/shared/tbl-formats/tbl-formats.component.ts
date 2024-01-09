import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-tbl-formats',
  templateUrl: './tbl-formats.component.html'
})
export class TblFormatsComponent {

   // modelo de referencia para modales
   modalRef: BsModalRef = new  BsModalRef;  

  // formato a modificar
  formatChangeState: any = { };
  
  // mensaje confirmacion actualizacion de estado formatos
  estateFormat = '';  

  // corinilla cargando
  load : boolean = false ;

  // session
  user: any = { };

  // variables de entrada y salida
  @Input() formats: any = [];
  @Output() idSelected = new EventEmitter<any>();
  
   // opcion tablas  
   dtOptions: DataTables.Settings = {};
   dtTrigger = new Subject();  

   constructor(private modal: BsModalService,
    private formatService: FormatService,
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
  formatSelected(id_formato: any){
    this.idSelected.emit(id_formato);
  }

  // cambia el estado de un formato
  changeState(check: any, template: TemplateRef<any>){    
    this.formatChangeState = this.formats.find((element: { id_formato: any; }) => element.id_formato == check.target.id);    
    this.formatChangeState.activo = !this.formatChangeState.activo ;
    let estado1 = !check.path[0].checked ? 'activo' : 'inactivo';    
    let estado2 = check.path[0].checked ? 'activo' : 'inactivo';    
    this.estateFormat = `Esta seguro de cambiar el estado de ${estado1} a ${estado2} para el formato ${this.formatChangeState.nombre_formato }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  // refresca el estado que no se modifico
  refreshState(){  
    this.formatChangeState.activo = !this.formatChangeState.activo ;  
  }

  // actualiza el estado de un formato
  async updateState(){  
    this.load = true;  
    this.formatChangeState.usuario_actualizacion = this.user.id_user ;

    let serviceResponse = await this.formatService.updateState(this.formatChangeState);
    
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
