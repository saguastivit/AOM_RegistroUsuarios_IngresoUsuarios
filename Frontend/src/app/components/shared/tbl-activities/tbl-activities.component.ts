import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ActivityService } from 'src/app/services/activity.service';

@Component({
  selector: 'app-tbl-activities',
  templateUrl: './tbl-activities.component.html'
})
export class TblActivitiesComponent {

   // modelo de referencia para modales
   modalRef: BsModalRef = new  BsModalRef;  

  // actividad a modificar
  activityChangeState: any = { };
  
  // mensaje confirmacion actualizacion de estado actividades
  estateActivity = '';  

  // corinilla cargando
  load : boolean = false ;

  // session
  user: any = { };

  // variables de entrada y salida
  @Input() activities: any = [];
  @Output() idSelected = new EventEmitter<any>();
  
   // opcion tablas  
   dtOptions: DataTables.Settings = {};
   dtTrigger = new Subject();
   
   constructor(private modal: BsModalService,
    private activityService: ActivityService,
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
  activitySelected(id_actividad: any){
    this.idSelected.emit(id_actividad);
  }

  // cambia el estado de una actividad
  changeState(check: any, template: TemplateRef<any>){    
    this.activityChangeState = this.activities.find((element: { id_actividad: any; }) => element.id_actividad == check.target.id);    
    this.activityChangeState.activo = !this.activityChangeState.activo ;
    let estado1 = !check.path[0].checked ? 'activo' : 'inactivo';    
    let estado2 = check.path[0].checked ? 'activo' : 'inactivo';    
    this.estateActivity = `Esta seguro de cambiar el estado de ${estado1} a ${estado2} para la actividad ${this.activityChangeState.des_actividad }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  // refresca el estado que no se modifico
  refreshState(){  
    this.activityChangeState.activo = !this.activityChangeState.activo ;  
  }

  // actualiza el estado de una empresa
  async updateState(){  
    this.load = true;  
    this.activityChangeState.usuario_actualizacion = this.user.id_user ;

    let serviceResponse = await this.activityService.updateState(this.activityChangeState);
    
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
