import { Component, TemplateRef, Input, ChangeDetectionStrategy, SimpleChanges, Output, EventEmitter  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CompanyService } from '../../../services/company.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ActivityService } from 'src/app/services/activity.service';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap'
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { SyncAsync } from '@angular/compiler/src/util';
import { from } from 'rxjs';

@Component({
  selector: 'app-info-bussines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info-bussines.component.html'
})
export class InfoBussinesComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;    

  // guuarda la lista de las actividades
  activities: any[] = [];  

  // guarda una lsita de servicios
  services: any[]= [];

  // opciones select 
  opcionesSeleccionadas: number[] = [];
  
  // guarda la configuracion del select
  dropdownSettings = {};

  // mensaje confirmacion actualizacion 
  estateCompany = '';  

  // mensaje confirmacion actualizacion 
  estateSync = '';  

  // bandera para la activacion de la edicion
  actualizar = false;

  // session
  user: any = { };

  // empresas sincronizadas
  businessSync: any[] = [];
  
  // empresas sincronizadas
  businessNoSync: any[] = [];

  // sincronizacion finalizada
  FlagSyncBusiness: boolean = false;

  // bander cortinilla sincronizacion
  FlagSyncCort: boolean = false;

  // bandera para cortinilla
  awaiting = false;
  awaitingSync = false;

  // agrega una clase para la mejor visualizacion de las tablas
  styleModal = '' ;

  // variables de entrada y salida
  @Input() selected: any = {};  

  ngOnChanges(){
    this.opcionesSeleccionadas = [ ];    
    if (Object.entries(this.selected).length != 0) {
      this.actualizar = true;  
      this.selected.empresa_actividad.forEach((element: { id_actividad: any; }) => {
        this.opcionesSeleccionadas.push(          
          this.activities.find(ac => ac.id_actividad == element.id_actividad)
        )
      });
    }    
  }

  constructor(private modal: BsModalService,
              private router: Router,
              private companyService: CompanyService,
              private activityService: ActivityService,
              private accordionConfig: NgbAccordionConfig,
              private toastr: ToastrService){
              this.loadSession();
              this.getServices();                            
              this.dropdownSettings = { 
                singleSelection: false, 
                idField: 'id_actividad',
                textField: 'des_actividad',
                selectAllText:'Seleccionar Todos',
                unSelectAllText:'Desmarcar Todos',
                enableSearchFilter: true,
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

  // cambia el estado de una empresa
  changeCompany(template: TemplateRef<any>){        
    this.estateCompany = `Esta seguro de cambiar los datos para la empresa ${this.selected.nombre_empresa }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {    
    this.modalRef = this.modal.show(template);
  }

  // actualizar la emrpesa a modificar
  updateFile(file: any){ 
    switch (file.id) {
        case "nit":
            this.selected.nit_empresa = file.value;
            break;       
        case "nitdv":
            this.selected.dv_nit_empresa = file.value;
            break; 
        case "sui":
            this.selected.cod_sui_empresa = file.value;
            break;   
        case "sigla":
            this.selected.sigla_empresa = file.value;
            break;  
        case "rz":
            this.selected.nombre_empresa = file.value;
            break;  
        case "cod":
            this.selected.cod_empresa = file.value;
            break;  
        default:
            this.selected.activo = file.checked;
            break;
    }
  }

  // limpiar formulario
  cleanForm(){    
    // this.actualizar = false;
    // this.selected = {};
    // this.opcionesSeleccionadas = [ ];    
    // this.ngOnChanges();
    window.location.reload();
  }

  // trae las actividades 
  getActivities(): void{
    this.activityService.getActivities().subscribe( (act: any) => {         
       this.activities = act;   
       this.activities.forEach(element => {
        element.des_actividad = element.des_actividad + ' - ' + this.services.find(s => s.id_servicio == element.id_servicio).nombre_servicio;
      });      
    });  
  }

  // trae las servicios 
  getServices(): void{
    this.activityService.getServices().subscribe( (serv: any) => {         
      this.services = serv;  
      this.getActivities();
    });      
    
  }
  
  // actualizar un registro completo // template: TemplateRef<any>
  async updateCompany(){ 
    this.awaiting = true;
    let serviceInternalResponse: any;
    this.selected.usuario_actualizacion = this.user.id_user ;    
    let serviceResponse = await this.companyService.update(this.selected);   
    if (serviceResponse == "ok") {

      let actividadesActualizadas: any = {
        empresa: this.selected.id_empresa,
        usuario: this.user.id_user,
        actividades: this.opcionesSeleccionadas
      }
      serviceInternalResponse = await this.companyService.updateActivities(actividadesActualizadas);    
      if (serviceInternalResponse == "ok" || serviceInternalResponse == "") {                
        this.toastr.success('Datos actualizados, recargando...', '', {
          timeOut: 3000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }else{
        this.toastr.error('No se pudo actualizar algunas actividades', '', {
          timeOut: 3000,
        });
      }
    }else{
      this.toastr.error('No se pudo actualizar', '', {
        timeOut: 3000,
      });
    }  
    // this.getBusiness();
    this.awaiting = false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  }

  // agregar nuevo registro  
  async insertCompany(){
    this.awaiting = true;
    if (this.opcionesSeleccionadas.length < 1) {
      this.toastr.info('Seleccione minimo 1 actividad', '', {
        timeOut: 3000,
      });
    }else{
      let serviceInternalResponse: any;
      this.selected.usuario_creacion = this.user.id_user;
      this.selected.activo = true ;
      let serviceResponse = await this.companyService.insert(this.selected);
    
      if (serviceResponse > 0) {

        let nuevasActividades: any = {
          empresa: serviceResponse,
          usuario: this.user.id_user,
          actividades: this.opcionesSeleccionadas
        }
        serviceInternalResponse = await this.companyService.saveActivities(nuevasActividades);  

        if (serviceInternalResponse == "ok") {
          this.toastr.success('Datos añadidos, recargando...', '', {
            timeOut: 3000,
          });        

          setTimeout(() => {
            window.location.reload();
          }, 2000); 
        }else{
          this.toastr.error('No se pudo insertar algunas actividades', '', {
            timeOut: 3000,
          });
        }
      }else{
        this.toastr.error('No se pudo insertar', '', {
          timeOut: 3000,
        });
      }     
    }
    this.awaiting = false;
  }


   
  // Abrir el modal de sinocronizacion 
  async syncCompany(template: TemplateRef<any>){
    this.estateSync='Estas seguro que deseas sincronizar los datos de la EMPRESA' 
    this.openModal(template)   
    if(this.businessSync.length > 0 || this.businessNoSync.length > 0){
        var modal = document.getElementsByClassName("modal-dialog");
        if (modal.length > 0) {
          modal[0].className += " modal-xl";    
        }
        
      }
    
     
  }  
  
  // carga las empresas antes de enviarlas a la tabla
  async syncBusiness(){  
    this.estateSync = ' ' ;
    this.FlagSyncCort = true ;
    let serviceInternalResponse: any;
  

    try {
      serviceInternalResponse = await this.companyService.syncBusiness();
      this.businessSync = serviceInternalResponse.listaEmpresasAgregadas;
      this.businessNoSync = serviceInternalResponse.listaEmpresasNoAgregadas;

      

      if(this.businessSync.length > 0 || this.businessNoSync.length > 0){
        var modal = document.getElementsByClassName("modal-dialog");
        modal[0].className += " modal-xl";  
      }
      
      this.FlagSyncBusiness = true;
            

    } catch (error) {      
      this.toastr.error('Error en la conexion a la BD Oracle', '', {
            timeOut: 3000,
      });            
    }   
    
    this.FlagSyncCort = false ;

    // setTimeout(() => {
    //   this.awaiting = false ;
    //   window.location.reload();
    // }, 2000);
    
    
    
  }
  
}

