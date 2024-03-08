import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InfoBasica } from 'src/app/models/register.models';
import { FormDataServiceService } from 'src/app/services/form-data-service.service';

import { RegisterApiService } from 'src/app/services/register-api.service';
import { StepStateService } from 'src/app/services/step-state.service';

@Component({
  selector: 'app-form-info-basic',
  templateUrl: './form-info-basic.component.html',
  styleUrls: ['./form-info-basic.component.css'],
})
export class FormInfoBasicComponent implements OnInit {
  infoBasicaForm: FormGroup;
  fileSelected?: string;
  errorMessage: string | null = null;

  isButtonDisabled(): boolean {
    let loading = false;
    this._formDataService.loading$.subscribe((value) => {
      loading = value;
    });
    return loading;
  }

  constructor(
    private fb: FormBuilder,
    private _stepStateService: StepStateService,
    public _registerApiService: RegisterApiService,
    public _formDataService: FormDataServiceService
  ) {
    this.infoBasicaForm = this.fb.group({
      tipoPersona: ['', Validators.required],
      numeroNit: ['', [Validators.required]],
      dv: ['', [Validators.required, Validators.pattern(/^[1-9]$/)]],
      nombreEmpresa: ['', Validators.required],
      telefonoEmpresa: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nameArchivoPDF: ['', Validators.required],
      archivoPDF: [null],
    });
  }

  ngOnInit() {
    this._stepStateService.setActiveStep('basico', 0);
    const storedData = this._formDataService.getFormData('infoBasica');
    if (storedData) {
      this.infoBasicaForm.patchValue(storedData);
      this.fileSelected = storedData.archivoPdf;
    }
  }

  formatNumeroNit(inputValue: string): string {
    const numericValue = inputValue.replace(/[^\d]/g, '');
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedValue;
  }

  get numeroNitValidators() {
    const tipoPersona = this.infoBasicaForm.get('tipoPersona')?.value;
    return tipoPersona === 'Persona Natural'
      ? [Validators.required, Validators.maxLength(13)]
      : [Validators.required, Validators.maxLength(11)];
  }

  handleNumeroNitInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const formattedValue = this.formatNumeroNit(inputElement.value);

    this.infoBasicaForm.get('numeroNit')?.setValue(formattedValue);
  }

  hasHerrors(controlName: string, errorType: string) {
    return (
      this.infoBasicaForm.get(controlName)?.hasError(errorType) &&
      this.infoBasicaForm.get(controlName)?.touched
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
          this.infoBasicaForm.get('archivoPDF')?.setValue(formData);
      };
  
      reader.readAsDataURL(selectedFile);
    }
  }


  handleFindNit(event: any) {
    const inputValue = event?.target?.value;

    if (inputValue) {
      this._registerApiService.validarEmpresa(inputValue).subscribe({
        next: (data) => {
          this.errorMessage =
            'El NIT que está ingresando ya se encuentra registrado en este sistema de información.';
        },
        error: (error) => {
          // Manejar errores aquí si es necesario
        },
        complete: () => {},
      });
    }
  }

  handleSubmit() {

    this.infoBasicaForm.markAllAsTouched();
    if (this.infoBasicaForm.valid) {
      const formValue: InfoBasica = this.infoBasicaForm.value;
      const body = {
        nit: formValue.numeroNit,
        dv: formValue.dv,
        nombreEmpresa: formValue.nombreEmpresa,
        telefonoEmpresa: formValue.telefonoEmpresa,
        correoEmpresa: formValue.email,
        archivoPdf:this.fileSelected,
      };
      this.infoBasicaForm.get('archivoPDF')?.setValue(this.fileSelected);
      this._formDataService.setFormData('infoBasica', formValue);

      this._registerApiService.postDataBasic(body).subscribe({
        next: (data) => {
          this._stepStateService.setActiveStep('contacto', data.solicitudId);
        },
        error: (error) => {
          this.errorMessage =
            'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.';
        },
        complete: () => {},
      });
    }
  }
}
