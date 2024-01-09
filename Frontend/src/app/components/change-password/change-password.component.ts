import { LoginService } from '../../services/login.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Validators } from '@angular/forms';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.sass']
})


export class ChangePasswordComponent implements OnInit {

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,}$/;

  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;

  // Datos de recuperar contraseña
  recoverPasswordData = { user: '', pass: '', confpass: ''};

  // captura un errror de la peticion
  mensajeErrorUsuario = '';
  mensajeErrorPass = '';
  mensajeErrorConfPass = '';
  mensajeConfSend = '';
  mensajeErrSend = '';

  // bandera de mensajes
  banderaError = false;

  // bandera de acceso
  Access = true;
  send = false;

  constructor(
    private router: Router,
    private route : ActivatedRoute,
    private modal: BsModalService,
    private loginService: LoginService ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.has("user")) {
        this.recoverPasswordData.user = params.get("user") || '';
      }
    });
  }

  volver(){
    this.router.navigate(['Login']);
    this.modal.hide();
  }

  // actualizar el usuario a modificar
  updateUser(file: any){

    switch (file.id) {
      case "pass":
          this.mensajeErrorPass = '';
          this.recoverPasswordData.pass = file.value;
          break;
      case "confpass":
          this.mensajeErrorConfPass = '';
          this.recoverPasswordData.confpass = file.value;
          break;
      default:
          break;
    }
  }


  validatePassword(){

    let flagValidacion = true ;

    // validacion de largo
    if (this.recoverPasswordData.user == '') {
      this.mensajeErrorUsuario = 'El usuario no puede ser vacio o nulo.';
      flagValidacion = false;
    } 

    if (this.recoverPasswordData.pass == '') {
      this.mensajeErrorPass = 'La contraseña no puede ser vacia o nula.';
      flagValidacion = false;
      
    } else if (this.recoverPasswordData.pass.length < 8) {
      this.mensajeErrorPass = 'La contraseña no cumple con los requerimientos fundamentales.';
      flagValidacion = false;
    } else if (!/[A-Z]/.test(this.recoverPasswordData.pass)) {
      this.mensajeErrorPass = 'La contraseña no cumple con los requerimientos fundamentales.';
      flagValidacion = false;
    } else if (!/[a-z]/.test(this.recoverPasswordData.pass)) {
      this.mensajeErrorPass = 'La contraseña no cumple con los requerimientos fundamentales.';
      flagValidacion = false;
    } else if (!/\d/.test(this.recoverPasswordData.pass)) {
      this.mensajeErrorPass = 'La contraseña no cumple con los requerimientos fundamentales.';
      flagValidacion = false;
    }else if (!/[$@$!%*?&]/.test(this.recoverPasswordData.pass)) {
      this.mensajeErrorPass = 'La contraseña no cumple con los requerimientos fundamentales.';
      flagValidacion = false;
    }

    if (this.recoverPasswordData.confpass == '') {
      this.mensajeErrorConfPass = 'La contraseña no puede ser vacia o nula.';
      flagValidacion = false;
    }else if (this.recoverPasswordData.confpass != this.recoverPasswordData.pass) {
      this.mensajeErrorConfPass = 'Las contraseñas no coinciden.';
      flagValidacion = false;
    }

    return flagValidacion ;

  }





  recoverPassword(template: TemplateRef<any>){
    // inicializa
    const validacion = this.validatePassword();

    if (validacion) {

      this.banderaError = false;
      this.openModal(template);

      this.loginService.updatePassword(this.recoverPasswordData)
      .subscribe(
        res => {
          if (res == "ok") {
            this.mensajeConfSend = 'Cambio de contraseña realizado exitosamente.'
          }else{
            this.mensajeErrSend = 'Hubo un error, intente nuevamente mas tarde';
          }

          var cortinilla = document.getElementById("cortinillaShow");
          var returnShow = document.getElementById("returnShow");
          if (cortinilla != null && returnShow != null) {
            cortinilla.style.display = 'none';
            returnShow.style.display = 'block';
          }
        },
        err => console.log(err)
      );
    }
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }




}
