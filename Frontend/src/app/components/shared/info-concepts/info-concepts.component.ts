import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ConceptService } from '../../../services/concept.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info-concepts',
  templateUrl: './info-concepts.component.html'
})
export class InfoConceptsComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new BsModalRef;

  // mensaje confirmacion actualizacion 
  estateConcept = '';

  // bandera para la activacion de la edicion
  actualizar = false;

  // marca la opcion seleccionada del combo select
  nivelSeleccionado: number = 0;

  // padre seleccionado
  padreSeleccionado: string = "0";

  // tipo concepto seleccionado 
  tipoConceptoSeleccionado: string = "0";

  // tipo concepto seleccionado 
  tipoNaturalezaSeleccionado: string = "0";

  // construccion del codigo 
  buildCode = "";

  // padres segun nivel
  padresPorNivel: any[] = [];

  // formatos a almacenar
  formatosReady: any[] = [];

  // ckecked select all
  allSelect: boolean = false;

  // checked select padres
  fatherSelect: boolean = false;

  // bandera para cortinilla
  awaiting = false;

  // session
  user: any = {};

  // variables de entrada y salida
  @Input() selected: any = {};
  @Input() concepts: any[] = [];
  @Input() formatos: any[] = [];
  @Input() conceptsType: any[] = [];
  @Input() conceptsNature: any[] = [];

  ngOnChanges() {
    if (Object.entries(this.selected).length != 0) {
      this.formatosReady = [];
      this.buildCode = this.selected.cod_concepto;

      this.nivelSeleccionado = this.selected.nivel_concepto;
      this.padreSeleccionado = this.selected.nombre_padre;

      this.selected.concepto_formato.forEach((element: { id_formato: any; tipo_formato: number; }) => {
        this.formatosReady.push(
          this.formatos.find(fr => fr.id_formato == element.id_formato)
        )
      });

      if (this.selected.id_tipo_concepto != null) {
        this.tipoConceptoSeleccionado = this.selected.id_tipo_concepto
      } else {
        this.tipoConceptoSeleccionado = "0";
      };

      if (this.selected.id_naturaleza_concepto != null) {
        this.tipoNaturalezaSeleccionado = this.selected.id_naturaleza_concepto
      } else {
        this.tipoNaturalezaSeleccionado = "0";
      };

      this.loadFathersSelected();
      this.actualizar = true;
    }
  }

  constructor(private modal: BsModalService,
    private router: Router,
    private conceptService: ConceptService,
    private toastr: ToastrService) {
    this.actualizar = false;
    this.loadSession();
  }

  // trae la sesion
  loadSession() {
    let session = localStorage.getItem('sessionUser');
    if (session != null) {
      this.user = JSON.parse(session);
    }
  }

  // cambia el estado de una empresa
  changeConcept(template: TemplateRef<any>) {
    this.estateConcept = `Esta seguro de cambiar los datos para el concepto ${this.selected.cod_concepto}`;
    this.openModal(template);
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  // carga los formatos disponibles
  uploadFormats(event: any) {
    let frm = {
      id_formato: parseInt(event.target.value)
    };

    if (event.target.checked) {
      this.formatosReady.push(frm)
    } else {
      for (var i = 0; i < this.formatosReady.length; i++) {
        if (this.formatosReady[i].id_formato === frm.id_formato) {
          this.formatosReady.splice(i, 1);
        }
      }
    }

    console.log(this.formatosReady);
  }

  // carga todos los formatos
  allFormats(all: any) {
    if (all.checked) {
      this.allSelect = true;
      this.fatherSelect = false;
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
      this.fatherSelect = false;
      this.allSelect = false;

      this.formatos.forEach(element => {
        element.activoCheck = false;
      });
    }
  }

  // cargalos formatos del padre
  fatherFormats(fat: any) {
    if (this.padreSeleccionado == "0") {
      this.toastr.warning('Seleccione un padre para poder heredar sus formatos', '', {
        timeOut: 3000,
      });
      this.fatherSelect = false;
      this.allSelect = false;

      this.formatosReady = [];
      this.modal.hide();
    } else if (this.padreSeleccionado == "00000000") {
      this.toastr.warning('El formato raiz 00000000 no cuenta con formatos por heredar', '', {
        timeOut: 3000,
      });
      this.fatherSelect = false;
      this.allSelect = false;

      this.formatosReady = [];
      this.modal.hide();
    } else {

      if (fat.checked) {
        this.allSelect = false;
        this.fatherSelect = true;
        this.formatosReady = this.concepts.find(c => c.cod_concepto == this.padreSeleccionado).concepto_formato;

        console.log(this.concepts);
        console.log(this.formatosReady);

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
        this.fatherSelect = false;
        this.allSelect = false;

        this.formatos.forEach(element => {
          element.activoCheck = false;
        });
      }
    }
  }

  // extrae el codigo segun el nivel
  FileSubstring(cod: any) {
    if (this.selected.cod_concepto != null) {
      switch (this.nivelSeleccionado) {
        case 1:
          cod.value = this.selected.cod_concepto.substring(0, 2);
          break;
        case 1:
          cod.value = this.selected.cod_concepto.substring(0, 2);
          break;
        case 1:
          cod.value = this.selected.cod_concepto.substring(0, 2);
          break;
        case 1:
          cod.value = this.selected.cod_concepto.substring(0, 2);
          break;
        default:
          cod.value = '';
          break;
      }
    } else {
      cod.value = '';
    }

  }

  // actualizar el concepto a modificar
  updateFile(file: any, cod?: any) {
    switch (file.id) {
      case "nivel":
        this.buildCode = "";

        // limpia campos editables obligatorios
        this.formatosReady = [];
        this.selected.cod_concepto = "";
        this.tipoConceptoSeleccionado = "0";
        this.selected.id_concepto_padre = "";
        this.tipoNaturalezaSeleccionado = "0";
        this.selected.descripcion_concepto = "";
        this.selected.concepto_cargado = false;
        this.selected.flag_ref_normativa = false;
        this.selected.nivel_concepto = file.value;

        if (file.value == 1) {
          this.buildCode = ' - XX000000'
        }

        cod.value = '';
        break;
      case "padre":
        if (file.value != "00000000" && file.value != "0") {
          this.selected.id_concepto_padre = this.concepts.find(c => c.cod_concepto == file.value).id_concepto;
        } else {
          this.buildCode = "";
        }
        this.buildCodeEx(this.nivelSeleccionado, file.value);
        
        this.fatherSelect = false;
        this.allSelect = false;

        this.formatosReady = [];

        cod.value = '';
        break;
      case "codigo":
        if (this.padreSeleccionado == "0") {
          this.toastr.warning('Seleccione un padre valido', '', {
            timeOut: 3000,
          });
          file.value = "";
        } else {
          this.changeCode(this.nivelSeleccionado, file.value);
          this.selected.cod_concepto = file.value;
        }
        break;
      case "tipo":
        this.selected.id_tipo_concepto = file.value;
        break;
      case "nat":
        this.selected.id_naturaleza_concepto = file.value;
        break;
      case "desc":
        this.selected.descripcion_concepto = file.value;
        break;
      case "cref":
        this.selected.flag_ref_normativa = file.checked;
        break;
      case "load":
        this.selected.concepto_cargado = file.checked;
        break;
      case "estate":
        this.selected.activo = file.checked;
        break;
      default:
        break;
    }
  }

  // cambia el codigo a enviar
  changeCode(level: any, value: any) {
    if (level == 1) {
      if (value.length == 1) {
        this.buildCode = " - " + value + "X000000";
      } else if (value.length == 2) {
        this.buildCode = " - " + value + "000000";
      } else {
        this.buildCode = " - XX000000";
      }
    }

    if (level == 2) {
      if (value.length == 1) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 2) + value + "X0000";
      } else if (value.length == 2) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 2) + value + "0000";
      } else {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 2) + "XX0000";
      }
    }

    if (level == 3) {
      if (value.length == 1) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 4) + value + "X00";
      } else if (value.length == 2) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 4) + value + "00";
      } else {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 4) + "XX00";
      }
    }

    if (level == 4) {
      if (value.length == 1) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 6) + value + "X";
      } else if (value.length == 2) {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 6) + value + "";
      } else {
        this.buildCode = " - " + this.padreSeleccionado.substring(0, 6) + "XX";
      }
    }
  }

  // construlle el codigo segun su nivel
  buildCodeEx(level: any, value: any) {
    if (level == 1 && value != "0") {
      this.buildCode = " - XX000000";
    }

    if (level == 2 && value != "0") {
      this.buildCode = " - " + this.padreSeleccionado.substring(0, 2) + "XX0000";
    }

    if (level == 3 && value != "0") {
      this.buildCode = " - " + this.padreSeleccionado.substring(0, 4) + "XX00";
    }

    if (level == 4 && value != "0") {
      this.buildCode = " - " + this.padreSeleccionado.substring(0, 6) + "XX";
    }
  }

  // limpiar formulario
  cleanForm() {
    window.location.reload();
  }

  // carga los conceptos padres para cada concepto hijo
  loadFathersSelected() {
    this.padresPorNivel = [];
    // reinicia los checks 
    this.allSelect = false;
    this.fatherSelect = false;
    
    let nivelPadre = this.nivelSeleccionado - 1;
    if (nivelPadre == 0) {
      this.padresPorNivel.push({
        cod_concepto: "00000000"
      });

      this.padreSeleccionado = '00000000';

    } else {
      // this.padreSeleccionado = '0';
      this.padresPorNivel = this.concepts.filter(f => f.nivel_concepto == nivelPadre);
    }
  }

  // carga el modal de los formatos
  loadFormats(template: TemplateRef<any>) {
    if (this.formatosReady.length > 0) {

      this.formatos.forEach(element => {

        let formato = this.formatosReady.find(f => f.id_formato == element.id_formato);

        if (formato != null) {
          element.activoCheck = true;
        } else {
          element.activoCheck = false;
        }
      });
    } else {
      this.formatos.forEach(element => {
        element.activoCheck = false;
      });
    }

    this.openModal(template);
    var modal = document.getElementsByClassName("modal-dialog");
    modal[0].className += " modal-lg";
  }

  // valida el formulario
  validateConcept(accion: string) {
    this.awaiting = true;
    try {      
      let aceptedConditional = true;

      if (this.nivelSeleccionado == 0) {
        this.toastr.warning('El nivel del concepto es obligatorio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };
  
      if (this.padreSeleccionado == "0") {
        this.toastr.warning('El padre del concepto es obligatorio', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };
  
      if (this.selected.cod_concepto == "" || this.selected.cod_concepto == "00" || this.selected.cod_concepto.length < 2) {
        this.toastr.warning('El codigo ingresado no es permitido', '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      };
  
      if (this.selected.descripcion_concepto == "") {
        this.toastr.warning('Debe contar con una minima descripcion', '', {
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
  
      let validacion = this.concepts.find(c => c.cod_concepto == this.buildCode.substr(3, 12));
  
      if (validacion != null) {
        this.toastr.info(`El codigo ${this.buildCode.substr(3, 12)} ya existe`, '', {
          timeOut: 3000,
        });
        aceptedConditional = false;
      }
  
      if (aceptedConditional) {
        if (accion === 'crear') {
          this.insertConcept();
        }
  
        if (accion === 'actualizar') {
          this.updateConcept();
        }
      }else{
        this.awaiting = false;
      }

    } catch (error) { 
      this.awaiting = false;
    }
  }

  // actualizar un registro completo // template: TemplateRef<any>
  async updateConcept() {
    let serviceInternalResponse: any;
    this.selected.usuario_actualizacion = this.user.id_user;
    let serviceResponse = await this.conceptService.update(this.selected);

    if (serviceResponse == "ok") {

      let formatosAsociados: any = {
        concepto: this.selected.id_concepto,
        usuario: this.user.id_user,
        formatos: this.formatosReady
      }
      console.log(this.selected);
      serviceInternalResponse = await this.conceptService.updateFormats(formatosAsociados);
      if (serviceInternalResponse == "ok" || serviceInternalResponse == "") {
        this.toastr.success('Datos actualizados, recargando...', '', {
          timeOut: 3000,
        });

        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        this.toastr.error('No se pudo actualizar algunos formatos', '', {
          timeOut: 3000,
        });
      }
    } else {
      this.toastr.error('No se pudo actualizar', '', {
        timeOut: 3000,
      });
    }    
  }

  // agregar nuevo registro
  async insertConcept() {   

    let serviceInternalResponse: any;
    this.selected.usuario_creacion = this.user.id_user;
    this.selected.activo = true;
    let serviceResponse = await this.conceptService.insert(this.selected);

    if (serviceResponse > 0) {
      let formatosAsociados: any = {
        concepto: serviceResponse,
        usuario: this.user.id_user,
        formatos: this.formatosReady
      }

      serviceInternalResponse = await this.conceptService.saveForms(formatosAsociados);

      if (serviceInternalResponse == "ok") {
        this.toastr.success('Concepto añadido, recargando...', '', {
          timeOut: 3000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.toastr.error('No se pudo insertar algunos formatos', '', {
          timeOut: 3000,
        });
      }
    } else {
      this.toastr.error('No se pudo insertar', '', {
        timeOut: 3000,
      });
    }
  }

}
