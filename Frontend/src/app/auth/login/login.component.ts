import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthApiService } from 'src/app/services/auth-api.service';
import { LoginService } from 'src/app/services/login.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  mensajeErrorLogin: string = '';
  modalRef?: BsModalRef;
  emailForgot: string = '';
  forgotpassMesage?: string;
  @ViewChild('modalLogin') modalLogin!: TemplateRef<void>;
  hasStateChanged: boolean = false;
  isAdministrador: boolean = false;

  // captura un errror de la peticion
  mensajeSend = '';

  // bandera de mensajes
  banderaError = false;
  banderaSend = false;

  // bandera de acceso
  Access = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthApiService,
    private modalService: BsModalService,
    private loginService: LoginService
  ) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.email]],
      pass: ['', Validators.required],
    });
  }

  openSuccessModal() {
    this.modalRef = this.modalService.show(this.modalLogin, {
      class: 'modal-lg',
    });
    this.hasStateChanged = false;
    this.clearMessages();
  }
  clearMessages() {
    this.mensajeErrorLogin = '';
    this.forgotpassMesage = '';
  }

  handleChange(event: any) {
    const checked = event.target.checked;
    this.isAdministrador = checked;
  }

  //envia correo electronico
  sendEmail() {
    this.loginService.recoverPassword(this.emailForgot).subscribe(
      (res) => {
        if (res == 'ok') {
          this.banderaSend = true;
          this.forgotpassMesage =
            'Si usted tiene cuenta en nuestro sistema, recibira un email con las instrucciones para recuperar la contraseña. Si no lo encuentra, por favor revise la carpeta de spam.';
          this.modalRef?.hide();
        } else {
          this.banderaSend = true;
          this.mensajeSend =
            'Hubo un error en el llamado al servicio, intente nuevamente mas tarde';
          this.modalRef?.hide();
        }
        this.hasStateChanged = true;
      },
      (err) => {
        this.hasStateChanged = true;
      }
    );
  }

  ngOnInit() {}

  handleSubmit() {
    this.clearMessages();
    this.hasStateChanged = false;
    if (this.loginForm.valid) {
      if (this.isAdministrador) {
        this.authService
          .login(this.loginForm.value.user, this.loginForm.value.pass)
          .subscribe(
            (data) => {
              // Maneja la respuesta del servidor aquí
              localStorage.setItem('sessionUser', JSON.stringify(data));
              if (
                data.rol === 'Administrador Prestador de Servicios Publicos'
              ) {
                this.router.navigate(['/solicitud']);
              } else {
                this.router.navigate(['/files']);
              }
            },
            (error) => {
              this.mensajeErrorLogin =
                'El usuario o la contraseña no son validas';
              this.hasStateChanged = true;
            }
          );
      } else {
        this.loginService.loginUser(this.loginForm.value).subscribe(
          (res) => {
            if (res != 'firstTime') {
              localStorage.setItem('sessionUser', JSON.stringify(res));
              this.router.navigate(['files']);
              this.Access = true;
            } else {
              this.mensajeErrorLogin =
                'Requiere cambiar la contraseña antes de hacer login';
              this.banderaError = true;
            }
          },
          (err) => {
            this.mensajeErrorLogin =
              'El usuario o la contraseña no son validas';
            this.banderaError = true;
          }
        );
      }
    } else {
      this.mensajeErrorLogin =
        'Formulario inválido. Por favor, complete todos los campos correctamente.';
      this.hasStateChanged = true;
    }
  }
}
