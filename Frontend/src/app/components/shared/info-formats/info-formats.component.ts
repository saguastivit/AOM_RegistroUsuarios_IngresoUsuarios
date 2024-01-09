import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ActivityService } from 'src/app/services/activity.service';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-info-formats',
  templateUrl: './info-formats.component.html'
})
export class InfoFormatsComponent {

  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;    

  // guarda una lsita de actividades
  activities: any[]= [];
  activitiesBack: any[]= [];

  // guarda una lsita de servicios
  services: any[]= [];

  // opciones select 
  opcionesSeleccionadas: number[] = [];
  
  // guarda la configuracion del select
  dropdownSettings = {};

  // mensaje confirmacion actualizacion 
  estateFormat = '';  

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
      this.getServices();      
      let actividad = this.activitiesBack.find(a => a.id_actividad == this.selected.id_actividad);
      console.log(actividad);
      if(actividad != null){
        // actividad.des_actividad = actividad.des_actividad + ' - ' + this.services.find(s => s.id_servicio == actividad.id_servicio).nombre_servicio;
        this.opcionesSeleccionadas.push(actividad);        
      }
    }else{
      this.selected.tipo_formato = 0 ; 
      this.getServices();    
    }  

    
  }

  constructor(private modal: BsModalService,
    private router: Router,
    private formatService: FormatService,
    private activityService: ActivityService,
    private toastr: ToastrService){
    this.loadSession();                             
    this.dropdownSettings = { 
      singleSelection: true, 
      idField: 'id_actividad',
      textField: 'des_actividad',
      closeDropDownOnSelection: true,
      classes:"myclass custom-class"
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
  changeFormat(template: TemplateRef<any>){        
    this.estateFormat = `Esta seguro de cambiar los datos para el formato ${this.selected.cod_formato }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {    
    this.modalRef = this.modal.show(template);
  }

  // trae las servicios 
  getServices(): void{
    this.activities = [] ;
    this.activityService.getServices().subscribe( (serv: any) => {         
      this.services = serv;  
      this.getActivities();
    });      
    
  }

  // trae las actividades 
  getActivities(): void{
    this.activityService.getActivitiesAll().subscribe( (serv: any) => {    
      this.activitiesBack = serv;

      this.activitiesBack.forEach(element => {
        element.des_actividad = element.des_actividad + ' - ' + this.services.find(s => s.id_servicio == element.id_servicio).nombre_servicio;
      });
      
      if (this.selected.tipo_formato == 0) {
        this.activities = this.activitiesBack.filter((s: { cod_actividad: string; }) => s.cod_actividad != '00') 
      }else{
        this.activities = this.activitiesBack.filter((s: { cod_actividad: string; }) => s.cod_actividad == '00')
      }

       
     
    });          
  }

  // actualizar la emrpesa a modificar
  updateFile(file: any){ 
    switch (file.id) {
        case "cod":
            this.selected.cod_formato = file.value;
            break;  
        case "fort":
            this.selected.nombre_formato = file.value;
            break;         
        case "tram":
            this.selected.flag_formato_div = file.checked;
            break; 
          case "base":            
            if (file.checked) {
              this.selected.tipo_formato = 1;
            }else{
              this.selected.tipo_formato = 0;
            }
            this.opcionesSeleccionadas = [ ];  
            this.getServices();
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
  validateFormat(accion: string) {
    this.awaiting = true;
    try {      
      let aceptedConditional = true;

      if (this.selected.cod_formato == undefined || this.selected.cod_formato == "" ) {
        this.toastr.warning('El codigo ingresado no es permitido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };

      if (this.selected.nombre_formato == undefined || this.selected.nombre_formato == "") {
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
        let actividad: any = this.opcionesSeleccionadas[0];
        this.selected.id_actividad = actividad.id_actividad;
      };
  
      if (aceptedConditional) {
        if (accion === 'crear') {
          this.insertFormat();
        }
  
        if (accion === 'actualizar') {
          this.updateFormat();
        }
      }else{
        this.awaiting = false;
      }

    } catch (error) { 
      this.awaiting = false;
    }
  }

   // actualizar un registro completo // template: TemplateRef<any>
   async updateFormat(){ 
    this.selected.usuario_actualizacion = this.user.id_user ;    
    let serviceResponse = await this.formatService.update(this.selected);   
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
  async insertFormat(){
    
      this.selected.usuario_creacion = this.user.id_user;
      this.selected.activo = true ;
      let serviceResponse = await this.formatService.insert(this.selected);    
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
