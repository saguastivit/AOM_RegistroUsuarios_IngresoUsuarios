import { Component,  OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observer } from 'rxjs';
import { DatosContacto } from 'src/app/models/register.models';
import { FormDataServiceService } from 'src/app/services/form-data-service.service';
import { RegisterApiService } from 'src/app/services/register-api.service';
import { StepStateService } from 'src/app/services/step-state.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-form-datos-contacto',
  templateUrl: './form-datos-contacto.component.html',
  styleUrls: ['./form-datos-contacto.component.css'],
})
export class FormDatosContactoComponent implements OnInit {
  datosContactoForm: FormGroup;
  fileSelected?: string;
  solicitudId?: number;
  errorMessage: string | null = null;
  modalRef?: BsModalRef;
  @ViewChild('modalTemplate') modalTemplate!: TemplateRef<void>;

  constructor(
    private fb: FormBuilder,
    private _stepStateService: StepStateService,
    private _registerApiService: RegisterApiService,
    public _formDataService: FormDataServiceService,
    private modalService: BsModalService,
    private router: Router

  ) {
    this.datosContactoForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      telefonoContacto: [''],
      ext: [''],
      celular: [''],
      email: ['', [Validators.required, Validators.email]],
      esRepresentanteLegal: [false],
      archivoIdentidadPDF: [null],
    });

    this.datosContactoForm.setValidators(
      this.telefonoCelularValidator.bind(this)
    );
  }

  ngOnInit() {
    this.solicitudId = this._stepStateService.getIdRegistro();
    const storedData = this._formDataService.getFormData('infoContacto');
    if (storedData) {
      this.datosContactoForm.patchValue(storedData);
      this.fileSelected = storedData.archivoPdf;
    }
  }

  telefonoCelularValidator(control: AbstractControl): ValidationErrors | null {
    const telefono = control.get('telefonoContacto')?.value;
    const celular = control.get('celular')?.value;
    const esRepresentanteLegal = control.get('esRepresentanteLegal')?.value;
    const archivoPDF = control.get('archivoIdentidadPDF')?.value;
    if (!telefono && !celular) {
      return { requireOne: true };
    }
    if (esRepresentanteLegal && !archivoPDF) {
      return { archivopdf: true };
    }

    return null;
  }

  get numeroCedulaValidators() {
    const tipoCedula = this.datosContactoForm.get('tipoDocumento')?.value;
    return tipoCedula === 'cedula-extranjeria'
      ? [Validators.required, Validators.maxLength(7)]
      : [Validators.required, Validators.maxLength(10)];
  }

  hasHerrors(controlName: string, errorType: string) {
    return (
      this.datosContactoForm.get(controlName)?.hasError(errorType) &&
      this.datosContactoForm.get(controlName)?.touched
    );
  }

  handleBack() {
    this._stepStateService.setActiveStep('basico', this.solicitudId);
  }

  handleChange(event: any) {
    const checked = event.target.checked;

    this.setValueAndChange(checked);
  }

  setValueAndChange(value: boolean) {
    this.datosContactoForm.get('esRepresentanteLegal')?.setValue(value);
    this._stepStateService.setActiveStep(
      'contacto',
      this.solicitudId,
      value
    );
  }

  handleFileChange(event: any) {
    const fileInput = event.target as HTMLInputElement;
    const files: FileList | null = fileInput.files;
  
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
          const formData = new FormData();
          formData.append('archivoPDF', selectedFile);
          this.fileSelected = base64;          
      };
  
      reader.readAsDataURL(selectedFile);
    }
  }
  handleSubmit() {
    this.datosContactoForm.markAllAsTouched();
    if (this.datosContactoForm.valid) {
      const formValue = this.datosContactoForm.value;

      const body: DatosContacto = {
        tipoDocIdentidad: formValue.tipoDocumento,
        numeroDocIdentidad: formValue.numeroDocumento,
        primerNombre: formValue.primerNombre,
        segundoNombre: formValue.segundoNombre,
        primerApellido: formValue.primerApellido,
        segundoApellido: formValue.segundoApellido,
        numeroTelefono: formValue.telefonoContacto,
        ext: formValue.ext,
        numeroCelular: formValue.celular,
        correoElectronico: formValue.email,
        esRepresentanteLegal: formValue.esRepresentanteLegal,
        archivoIdentidad: this.fileSelected,
       
        documentoIdentidad:this.fileSelected,
        solicitudId: this._stepStateService.getIdRegistro(),
      };

      const observer: Observer<any> = {
        next: (data: any) => {
          if (!formValue.esRepresentanteLegal) {
            this._stepStateService.setActiveStep(
              'representante',
              data.solicitudId,
              formValue.esRepresentanteLegal
            );
          }
        },
        error: (error: any) => {
          this.errorMessage =
            'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.';
        },
        complete: () => {},
      };
      this._formDataService.setFormData('infoContacto', formValue);
      if (formValue.esRepresentanteLegal) {
        this._registerApiService
          .postDataRepresentante(body)
          .subscribe(observer);
      } else {
        this._registerApiService.postDataContacto(body).subscribe(observer);
      }

      if(formValue.esRepresentanteLegal){
        this.openSuccessModal();
      }

    }
  }

  openSuccessModal() {
    this.modalRef = this.modalService.show(this.modalTemplate);
    this.modalRef?.onHidden?.subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
