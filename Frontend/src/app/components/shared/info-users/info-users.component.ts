import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-info-users',
  templateUrl: './info-users.component.html',
  styleUrls: ['./info-users.component.sass']
})
export class InfoUsersComponent {
  
  private emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;    

  // guarda una lsita de roles
  rols: any[]= [];

  // opciones select 
  rolSeleccionado: string = "0";
  
  // guarda la configuracion del select
  dropdownSettings = {};

  // mensaje confirmacion actualizacion 
  estateUser = '';  

  // bandera para la activacion de la edicion
  actualizar = false;

  // session
  user: any = { };

  // bandera para cortinilla
  awaiting = false;

  // variables de entrada y salida
  @Input() users: any = [];
  @Input() selected: any = {};  

  ngOnChanges(){
    this.rolSeleccionado = "0";    
    if (Object.entries(this.selected).length != 0) {
      this.actualizar = true;  
      if (this.selected.id_rol != null) {
        this.rolSeleccionado = this.selected.id_rol
      } else {
        this.rolSeleccionado = "0";
      };
    }    
  }

  constructor(private modal: BsModalService,
    private router: Router,
    private userService: UsersService,
    private toastr: ToastrService) {
      this.loadSession();
      this.getRols();  
     }

 
  // trae la sesion
  loadSession(){   
    let session = localStorage.getItem('sessionUser');
    if (session != null) {
      this.user = JSON.parse(session);  
    }
  }

  // cambia el estado de una actividad
  changeUser(template: TemplateRef<any>){        
    this.estateUser = `Esta seguro de cambiar los datos del usuario ${this.selected.usuario }`;      
    this.openModal(template);    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {    
    this.modalRef = this.modal.show(template);
  }

   // trae las servicios 
   getRols(): void{
    this.userService.getRols().subscribe( (role: any) => {         
      this.rols = role; 
    });      
    
  }

  // actualizar la emrpesa a modificar
  updateFile(file: any){ 
    switch (file.id) {
        case "fname":
          this.selected.nombre_persona = file.value;
          break;  
        case "user":
          this.selected.usuario = file.value;
          break;  
        case "email":
          if (file.value.match(this.emailRegex)){
            this.selected.correo_electronico = file.value;
          }else{
            this.toastr.warning('El correo electronico no es valido', '', {
              timeOut: 3000,
            });
          }
          break;         
        case "rol":
          if(file.value != "0"){
            this.selected.id_rol = Number(file.value);
          }         
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
  validateUser(accion: string) {
    let indice = 0 ;

    if (accion === 'actualizar') {
      indice = 1 ;
    }

    this.awaiting = true;
    try {      
      let aceptedConditional = true;
      if (this.selected.id_rol  == undefined || this.selected.id_rol  == 0) {
        this.toastr.warning('El rol es obligatorio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };
     

      if (this.selected.correo_electronico == undefined || this.selected.correo_electronico == "") {
        this.toastr.warning('Debe contar con un correo electronico valido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      } else if(this.users.filter((u: { correo_electronico: any; }) => u.correo_electronico == this.selected.correo_electronico).length > indice ) {
        this.toastr.warning('El correo electronico ya se encuentra registrado', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }

      if (this.selected.usuario == undefined || this.selected.usuario == "") {
        this.toastr.warning('Debe contar con un usuario valido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }else if (this.users.filter((u: { usuario: any; }) => u.usuario == this.selected.usuario).length > indice) {
        this.toastr.warning('El usuario ya se encuentra registrado', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }

      if (this.selected.nombre_persona == undefined || this.selected.nombre_persona == "") {
        this.toastr.warning('Debe contar con un nombre valido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }
  
      if (aceptedConditional) {
        if (accion === 'crear') {
          this.insertUser();
        }
  
        if (accion === 'actualizar') {
          this.updateUser();
        }
      }else{
        this.awaiting = false;
      }

    } catch (error) { 
      this.awaiting = false;
    }
  }
  
   // actualizar un registro completo // template: TemplateRef<any>
   async updateUser(){ 
    this.selected.usuario_actualizacion = this.user.id_user ;    
    let serviceResponse = await this.userService.update(this.selected);   
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
  async insertUser(){      
      this.selected.usuario_creacion = this.user.id_user;      
      let serviceResponse = await this.userService.insert(this.selected);
    
      if (serviceResponse == "ok") {

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
