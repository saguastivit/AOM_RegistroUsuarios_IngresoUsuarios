import { Component, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CostService } from '../../../services/cost.service';

@Component({
  selector: 'app-info-edc',
  templateUrl: './info-edc.component.html',
  styleUrls: ['./info-edc.component.sass'],
})
export class InfoEdcComponent  {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;    

  // mensaje confirmacion actualizacion 
  estateEdc = '';  

  // bandera para la activacion de la edicion
  actualizar = false;

  // formatos a almacenar
  formatosReady: any[] = [];

  // marca la opcion seleccionada del combo select
  padreSeleccionado: number = 0;


  // bandera para cortinilla
  awaiting = false;

   // ckecked select all
   allSelect: boolean = false;

  // session
  user: any = { };
  
  // variables de entrada y salida
  @Input() selected: any = { }; 
  @Input() edcs: any[] = []; 
  @Input() formatos: any[] = [];
  
  ngOnChanges(){
    if (Object.entries(this.selected).length != 0) {    
      this.formatosReady = [];
      this.allSelect = false;

      this.formatos.forEach(element => {
        element.padre = 0;
      });

      this.selected.edc_formato.forEach((element: { id_formato: any; id_edc_padre: any}) => {
        let item = this.formatos.find(fr => fr.id_formato == element.id_formato);
        if (item != null) {
          if (element.id_edc_padre != null) {
            item.padre = element.id_edc_padre;
          }
          
          this.formatosReady.push(item)
        }    
      });

      this.actualizar = true;   
    }    
  }


  constructor(private modal: BsModalService,
              private toastr: ToastrService,
              private router: Router,
              private costService: CostService) {
              this.actualizar = false;              
              this.loadSession();
  }

  // trae la sesion
  loadSession(){   
    let session = localStorage.getItem('sessionUser');
    if (session != null) {
      this.user = JSON.parse(session);  
    }
  }

  // carga el modal de los formatos
  loadFormats(template: TemplateRef<any>){    
    if (this.formatosReady.length > 0) {
      
      this.formatos.forEach(element => {  

        let formato = this.formatosReady.find(f => f.id_formato == element.id_formato);
        
        if (formato != null) {
          element.activoCheck = true; 
        }else{
          element.activoCheck = false;  
        }
      }); 
    }else{
      this.formatos.forEach(element => {  
        element.activoCheck = false;
        element.padre = 0;
      }); 
    }   
    console.log(this.formatos);
    this.openModal(template); 
    var modal = document.getElementsByClassName("modal-dialog");
    modal[0].className += " modal-lg"; 
  }

  // carga el modal de los formatos
  loadEdcFormats(template: TemplateRef<any>){    
    if (this.formatosReady.length > 0) {
      
      this.formatos.forEach(element => {  

        let formato = this.formatosReady.find(f => f.id_formato == element.id_formato);
        
        if (formato != null) {
          element.activoCheck = true; 
        }else{
          element.activoCheck = false;  
        }
      }); 
    }else{
      this.formatos.forEach(element => {  
        element.activoCheck = false;
        element.padre = 0;
      }); 
    }    
    
    this.selected.edc_formato

    console.log(this.formatosReady);

    this.openModal(template); 
    var modal = document.getElementsByClassName("modal-dialog");
    modal[0].className += " modal-lg"; 
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {    
    this.modalRef = this.modal.show(template);    
  }

  // carga los formatos disponibles
  uploadFormats(event:any, code:any){
    let frm = {
      id_formato: parseInt(event.target.value),
      id_edc_padre: (code == null ? 0 :parseInt(code))
    };

    if (event.target.checked) {
      this.formatosReady.push(frm)
    }else{
      for (var i =0; i < this.formatosReady.length; i++){
        if (this.formatosReady[i].id_formato === frm.id_formato) {
          this.formatosReady.splice(i,1);
        }
     }
    }   

    
  }

  // cambia el estado de una empresa
  changeEdc(template: TemplateRef<any>){    
    this.estateEdc = `Esta seguro de cambiar los datos para el concepto ${this.selected.cod_edc }`;      
    this.openModal(template);  
  }

  // limpiar formulario
  cleanForm(){    
    // limpia campos editables obligatorios 
    window.location.reload();
    // this.actualizar = false;
    // this.selected = {};
    // this.formatosReady = [] ;
    // this.ngOnChanges();
  }

  // actualizar el concepto a modificar
  updateFile(file: any, cod?: any){    
    switch (file.id) {
        case "codigo":
          console.log(this.selected);
            this.selected.cod_edc = file.value;
            break;       
        case "nombre":
            this.selected.nombre_edc = file.value;
            break; 
        case "descripcion":
            this.selected.descripcion_edc = file.value;
            break;   
        case "sigla":
          this.selected.activo = file.checked;
            break;
        case "padre":
            this.formatosReady.forEach(element => {
              if (element.id_formato == cod) {
                element.id_edc_padre = parseInt(file.value); 
              }  
            });
            
            
            break;
        default:
            this.selected.activo = file.checked;
            break;
      }
  }  

  // valida el formulario
  validateEdc(accion: string){
    console.log(this.formatosReady);
    debugger;
    
    this.awaiting = true;
    try {
      let aceptedConditional = true;
    
      if (this.selected.cod_edc == "" || this.selected.cod_edc == undefined) {
        this.toastr.warning('El codigo no puede ser vacio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }
  
      if (this.selected.nombre_edc == "" || this.selected.nombre_edc == undefined) {
        this.toastr.warning('El nombre no puede ser vacio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }
  
      if (this.formatosReady.length == 0) {
        this.toastr.warning('Debe asociar minimo un formato', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }     
  
      if (aceptedConditional) {
        if (accion === 'crear') {
          let flag = this.edcs.find(c => c.cod_edc == this.selected.cod_edc);
  
          if (flag != null) {
            this.toastr.info(`El codigo ${this.selected.cod_edc} ya existe`, '', {
              timeOut: 3000,
          });
          aceptedConditional = false;
        } else{
            this.insertEdc(); 
          }               
        }
  
        if (accion === 'actualizar') {    
          this.updateEdc();
        }
      }   
      this.awaiting = false; 
    } catch (error) {
     this.awaiting = false;
    }
      
  }

  // carga todos los formatos
  allFormats(all: any) {
    if (all.checked) {
      this.allSelect = true;
      this.formatosReady = this.formatos;

      this.formatos.forEach(element => {
        let formato = this.formatosReady.find(f => f.id_formato == element.id_formato);
        if (formato != null) {
          element.activoCheck = true;
        } else {
          element.activoCheck = false;
        }
      });
    } else {
      this.formatosReady = [];
      this.allSelect = false;

      this.formatos.forEach(element => {
        element.activoCheck = false;
      });
    }
  }

  // actualizar un registro completo // template: TemplateRef<any>
  async updateEdc(){ 
    let serviceInternalResponse: any;
    this.selected.usuario_actualizacion = this.user.id_user ;    
    let serviceResponse = await this.costService.update(this.selected);  
    if (serviceResponse == "ok") {
          
      let formatosAsociados: any = {
        concepto: this.selected.id_edc,
        usuario: this.user.id_user,
        formatos: this.formatosReady

      }
      
      serviceInternalResponse = await this.costService.updateFormats(formatosAsociados);         
      if (serviceInternalResponse == "ok" || serviceInternalResponse == "") {                        
        this.toastr.success('Datos actualizados, recargando...', '', {
          timeOut: 3000,
        });
  
        setTimeout(() => {
          location.reload();
        }, 2000); 
      }else{
        this.toastr.error('No se pudo actualizar algunos formatos', '', {
          timeOut: 3000,
        });
      }
    }else{
      this.toastr.error('No se pudo actualizar', '', {
        timeOut: 3000,
      });
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  }  

   // agregar nuevo registro
   async insertEdc(){  
    let serviceInternalResponse: any;
    this.selected.usuario_creacion = this.user.id_user;
    this.selected.activo = true ;
    let serviceResponse = await this.costService.insert(this.selected);
      
    if (serviceResponse > 0) {
      let formatosAsociados: any = {
        concepto: serviceResponse,
        usuario: this.user.id_user,
        formatos: this.formatosReady
      }

       serviceInternalResponse = await this.costService.saveForms(formatosAsociados);  

      if (serviceInternalResponse == "ok") {
        this.toastr.success('Edc añadido, recargando...', '', {
          timeOut: 3000,
        }); 
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);                
      }else{
        this.toastr.error('No se pudo insertar algunos formatos', '', {
          timeOut: 3000,
        });
      } 
    }else{
      this.toastr.error('No se pudo insertar', '', {
        timeOut: 3000,
      });
    }   
  }
}
