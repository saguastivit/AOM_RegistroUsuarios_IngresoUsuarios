import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CostService } from '../../../services/cost.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tbl-edc',
  templateUrl: './tbl-edc.component.html'
})
export class TblEdcComponent {
 // modelo de referencia para modales
 modalRef: BsModalRef = new  BsModalRef; 

 // edc a modificar
 edcChangeState: any = { };
 
 // mensaje confirmacion actualizacion de estado edc
 estateEdc = '';  
 
 // corinilla cargando
 load : boolean = false ;
 
 // session
 user: any = { };
 
 // variables de entrada y salida
 @Input() edcs: any = [];
 @Output() idSelected = new EventEmitter<any>();

 // opcion tablas  
 dtOptions: DataTables.Settings = {};
 dtTrigger = new Subject();

 constructor(private modal: BsModalService,
             private costService: CostService,
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
 edcSelected(id_concepto: any){
   this.idSelected.emit(id_concepto);
 }

 // cambia el estado de un concepto
 changeState(check: any, template: TemplateRef<any>){    
   console.log(check.path[0].checked);      
   this.edcChangeState = this.edcs.find((element: { id_edc: any; }) => element.id_edc == check.target.id);    
   this.edcChangeState.activo = !this.edcChangeState.activo ;
   let estado1 = !check.path[0].checked ? 'activo' : 'inactivo';    
   let estado2 = check.path[0].checked ? 'activo' : 'inactivo';    
   this.estateEdc = `Esta seguro de cambiar el estado de ${estado1} a ${estado2} para el concepto ${this.edcChangeState.cod_edc}`;      
   this.openModal(template);
 }

 // muestra una ventana modal
 openModal(template: TemplateRef<any>) {
   this.modalRef = this.modal.show(template);
 }

 // refresca el estado que no se modifico
 refreshState(){  
   this.edcChangeState.activo = !this.edcChangeState.activo ;  
 }

  // actualiza el estado de una empresa
  async updateState(){  
   this.load = true;  
   this.edcChangeState.usuario_actualizacion = this.user.id_user ;

   let serviceResponse = await this.costService.update(this.edcChangeState);
   
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
