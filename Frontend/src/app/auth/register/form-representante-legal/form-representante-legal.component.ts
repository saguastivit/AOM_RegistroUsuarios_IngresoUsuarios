import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosContacto } from 'src/app/models/register.models';
import { FormDataServiceService } from 'src/app/services/form-data-service.service';
import { RegisterApiService } from 'src/app/services/register-api.service';
import { StepStateService } from 'src/app/services/step-state.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-representante-legal',
  templateUrl: './form-representante-legal.component.html',
  styleUrls: ['./form-representante-legal.component.css'],
})
export class FormRepresentanteLegalComponent implements OnInit {
  datosRepresentanteForm: FormGroup;
  fileSelected?: string;
  solicitudId?:number = 0
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
    this.datosRepresentanteForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      telefonoContacto: ['', Validators.required],
      ext: [''],
      celular: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      archivoIdentidadPDF: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.solicitudId =this._stepStateService.getIdRegistro()
    const storedData = this._formDataService.getFormData('infoRepresentante');
    if (storedData) {
      this.datosRepresentanteForm.patchValue(storedData);
      this.fileSelected = storedData.archivoPdf;
    }
  }

  handleBack() {
    this._stepStateService.setActiveStep('contacto',this.solicitudId);
  }


  hasHerrors(controlName: string, errorType: string) {
    return (
      this.datosRepresentanteForm.get(controlName)?.hasError(errorType) &&
      this.datosRepresentanteForm.get(controlName)?.touched
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
    this.datosRepresentanteForm.markAllAsTouched();
    let messagesubmit = null;
    if (this.datosRepresentanteForm.valid) {
      const formValue = this.datosRepresentanteForm.value;
      const body:DatosContacto = {
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
        documentoIdentidad: this.fileSelected,
        solicitudId: this._stepStateService.getIdRegistro()
      };

      // Log FormData
      this._registerApiService.postDataRepresentante(body).subscribe({
        next: (data) => {
          this.openSuccessModal();
        },
        error(err) {
          messagesubmit = 'error';
        },
      });
      if (messagesubmit)
      this.errorMessage =
        'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.';
    }

  }

  openSuccessModal() {
    this.modalRef = this.modalService.show(this.modalTemplate);
    this.modalRef?.onHidden?.subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
