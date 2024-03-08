import { LoginService } from '../../services/login.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthService,
  AuthConfig,
  JwksValidationHandler,
} from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './login.config';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-login-api',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new BsModalRef();

  loginUserData = { user: '', pass: '' };
  test: any[] = [];

  // captura un errror de la peticion
  mensajeErrorLogin = '';
  mensajeSend = '';

  // bandera de mensajes
  banderaError = false;
  banderaSend = false;

  // bandera de acceso
  Access = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private modal: BsModalService,
    private oauthService: OAuthService,
    private loginService: LoginService
  ) {
    // this.configureSinglesSignOn();
    // this.logInTest();
  }

  // configureSinglesSignOn(): void{
  //   this.oauthService.configure(authCodeFlowConfig);
  //   this.oauthService.tokenValidationHandler = new JwksValidationHandler();
  //   this.oauthService.loadDiscoveryDocumentAndLogin();
  // }

  /* logInTest(): void{
    if (true) {
      this.router.navigate( ['files'] );
    }
  } */

  // autentica en el backend
  // tslint:disable-next-line: typedef
  loginUser(template: TemplateRef<any>) {
    // inicializa
    this.mensajeErrorLogin = '';
    this.banderaError = false;

    this.banderaSend = false;
    this.mensajeSend = '';

    this.openModal(template);
    this.loginService.loginUser(this.loginUserData).subscribe(
      (res) => {
        if (res != 'firstTime') {
          localStorage.setItem('sessionUser', JSON.stringify(res));
          this.router.navigate(['files']);
          this.modal.hide();
          this.Access = true;
        } else {
          this.mensajeErrorLogin =
            'Requiere cambiar la contraseña antes de hacer login';
          this.banderaError = true;
          this.modal.hide();
        }
      },
      (err) => {
        this.mensajeErrorLogin = 'El usuario o la contraseña no son validas';
        this.banderaError = true;
        this.modal.hide();
      }
    );
  }

  //envia correo electronico
  sendEmail() {
    if (this.loginUserData.user == '') {
      this.mensajeSend = 'Digite el usuario para la recuperacion';
      this.banderaSend = true;
    } else {
      this.mensajeErrorLogin = '';
      this.loginService.recoverPassword(this.loginUserData).subscribe(
        (res) => {
          if (res == 'ok') {
            this.banderaSend = true;

            this.mensajeSend = 'Validar correo electronico';
          } else {
            this.banderaSend = true;
            this.mensajeSend =
              'Hubo un error en el llamado al servicio, intente nuevamente mas tarde';
          }
        },
        (err) => console.log(err)
      );
    }
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }
}
