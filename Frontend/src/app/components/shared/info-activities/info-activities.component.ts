import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ActivityService } from 'src/app/services/activity.service';

@Component({
  selector: 'app-info-activities',
  templateUrl: './info-activities.component.html'
})
export class InfoActivitiesComponent {

  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;    

  // guarda una lsita de servicios
  services: any[]= [];

  // opciones select 
  opcionesSeleccionadas: number[] = [];
  
  // guarda la configuracion del select
  dropdownSettings = {};

  // mensaje confirmacion actualizacion 
  estateActivity = '';  

  // bandera para la activacion de la edicion
  actualizar = false;

  // session
  user: any = { };

  // bandera para cortinilla
  awaiting = false;

  // variables de entrada y salida
  @Input() selected: any = {};  

  ngOnChanges(){
    this.opcionesSeleccionadas = [ ];    
    if (Object.entries(this.selected).length != 0) {
      this.actualizar = true;  
      let servicio = this.services.find(s => s.id_servicio == this.selected.id_servicio);
      if(servicio != null){
        this.opcionesSeleccionadas.push(servicio);        
      }
    }    
  }

  constructor(private modal: BsModalService,
    private router: Router,
    private activityService: ActivityService,
    private toastr: ToastrService){
    this.loadSession();
    this.getServices();                            
    this.dropdownSettings = { 
      singleSelection: true, 
      idField: 'id_servicio',
      textField: 'nombre_servicio',
      closeDropDownOnSelection: true,
      classes:"myclass custom-class",
    };  
  }

  // trae la sesion
  loadSession(){   
    let session = localStorage.getItem('sessionUser');
    if (session != null) {
      this.user = JSON.parse(session);  
    }
  }

  // cambia el estado de una actividad
  changeActivity(template: TemplateRef<any>){        
    this.estateActivity = `Esta seguro de cambiar los datos para la actividad ${this.selected.des_actividad }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {    
    this.modalRef = this.modal.show(template);
  }

   // trae las servicios 
   getServices(): void{
    this.activityService.getServices().subscribe( (serv: any) => {         
      this.services = serv; 
    });      
    
  }

  // actualizar la emrpesa a modificar
  updateFile(file: any){ 
    switch (file.id) {
        case "cod":
            this.selected.cod_actividad = file.value;
            break;  
        case "act":
            this.selected.des_actividad = file.value;
            break;         
        default:
            this.selected.activo = file.checked;
            break;
    }
  }

   // limpiar formulario
  cleanForm(){    
    window.location.reload();
  }

  // valida el formulario
  validateActivity(accion: string) {
    this.awaiting = true;
    try {      
      let aceptedConditional = true;

      if (this.selected.cod_actividad == undefined || this.selected.cod_actividad == "" || this.selected.cod_actividad == "00" || this.selected.cod_actividad.length > 2) {
        this.toastr.warning('El codigo ingresado no es permitido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };

      if (this.selected.des_actividad == undefined || this.selected.des_actividad == "") {
        this.toastr.warning('Debe contar con un nombre', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }

      if (this.opcionesSeleccionadas.length == 0) {
        this.toastr.warning('El servicio de la actividad es obligatorio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }else{
        let servicio: any = this.opcionesSeleccionadas[0];
        this.selected.id_servicio = servicio.id_servicio;
      };
  
      if (aceptedConditional) {
        if (accion === 'crear') {
          this.insertActivity();
        }
  
        if (accion === 'actualizar') {
          this.updateActivity();
        }
      }else{
        this.awaiting = false;
      }

    } catch (error) { 
      this.awaiting = false;
    }
  }
  
   // actualizar un registro completo // template: TemplateRef<any>
   async updateActivity(){ 
    this.selected.usuario_actualizacion = this.user.id_user ;    
    let serviceResponse = await this.activityService.update(this.selected);   
    if (serviceResponse == "ok") {

      this.toastr.success('Datos actualizados, recargando...', '', {
        timeOut: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    }else{
      this.toastr.error('No se pudo actualizar', '', {
        timeOut: 3000,
      });
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  }

  // agregar nuevo registro  
  async insertActivity(){
    
      this.selected.usuario_creacion = this.user.id_user;
      this.selected.activo = true ;
      let serviceResponse = await this.activityService.insert(this.selected);
    
      if (serviceResponse > 0) {

        this.toastr.success('Datos añadidos, recargando...', '', {
          timeOut: 3000,
        });        

        setTimeout(() => {
          window.location.reload();
        }, 2000); 
      }else{
        this.toastr.error('No se pudo insertar', '', {
          timeOut: 3000,
        });
      }     

  }

 
  


}

