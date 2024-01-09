import { Observable } from 'rxjs';
import { Component, ElementRef, TemplateRef, ViewChild } from "@angular/core";
import { UploadService } from '../../services/upload.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { HttpResponse} from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.sass'],
  providers: [DatePipe]
})
export class FileUploadComponent{  
  modalRef: BsModalRef = new  BsModalRef;

  // marca la opcion seleccionada del combo select
  opcionSeleccionado: any[]  = [];

  // guarda el nombre de la empresa seleccionada
  empresaSeleccionada = ' ' ;

  // guarda el id de la empresa seleccionada para validaciones
  idempresaSeleccionada = 0;
  // selectedFiles!: FileList ;
  // progressInfos: any[] = [];

  // guarda una lista de todas las empresas permitidas
  businnes: any[] = [];  

  // guarda una lista de formatos permitidos por empresa
  formats: any[] = [];  

  // formatos permitidos por empresa 
  formatosPermitidos: string = ' ';

  // posibles mensajes de error
  message = '';

  // guarda la lista de archivos listos para cargar
  files: any[] = [];
  filesValidate: any[] = [];

  // guarda la respuesta de los observables
  serviceResponse: any[] = [];

   // variable para habilitar o deshabilitar el combo de cargue 
   disabled = true;
  
   // bandera para confirmaciond e carga
   confirmacion = true;

   // bandera para mensaje de espera
   load = false ;

  // bandera para continuar carge
   continuar = false ;

  // guarda la configuracion del select
  dropdownSettings = {};


  // observador
  fileInfos!: Observable<any>;

  // constructor 
  constructor(private uploadService: UploadService, 
              private modal: BsModalService, 
              private toastr: ToastrService,
              private datePipe: DatePipe) {
              this.getBusiness();
              this.dropdownSettings = { 
                singleSelection: true, 
                idField: 'cod_empresa',
                textField: 'nombre_empresa',
                allowSearchFilter: true,
                searchPlaceholderText: 'filtrar por',
                closeDropDownOnSelection: true,
                clearSearchFilter: true,
                classes:"myclass custom-class"
              };  
  } 
    
  //////////////////////////////////methods/////////////////////////////////////

  // trae las empresas 
  getBusiness(): void{
    this.uploadService.getBusiness().subscribe( (bus: any) => {
      this.businnes = bus;     
     });
  }

  // cargar formatos por empresa
  formatsByCompany(id: number): void{
    this.formatosPermitidos = ''
    this.uploadService.getFormatsByCompany(id).subscribe( (format: any) => {     
      this.formats = format;

      if (this.formats.length > 0) {
        this.formatosPermitidos = 'Los formatos admitidos para esta empresa son: ';
        this.formats.forEach(element => {
          this.formatosPermitidos +=  ` ${element.cod_formato} -`
        });

        this.formatosPermitidos = this.formatosPermitidos.slice(0,-1);        
      }
      
    });            
  }

  // valida los archivos cargados
  loadFiles(template: TemplateRef<any>): void {
    if (this.formats.length > 0) {
      if (this.files.length < 1) {
        this.toastr.warning('Seleccione minimo 1 archivo antes de continuar', '', {
          timeOut: 3000,
        });
      }else{
        this.validateDates(template);
      }     
    } else{
      this.toastr.warning('Seleccione una empresa antes de continuar', '', {
        timeOut: 3000,
      });
    }
  }

  //validar fechas para la carga
  validateDates(template: TemplateRef<any>){    
    // bandera interna de cargue
    let Icontinuar = true ;

    // fecha actual
    let dateNow = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    let myDate = moment(dateNow);        

    let objectSet: any = {
      formatos : [ ],
      empresa : this.idempresaSeleccionada.toString() 
    } ;

    this.files.forEach(element => {      
      let formato = element.name.split(".",1);
      formato = formato[0].split("-");      
      objectSet.formatos.push(`${formato[1]}-${formato[2]}`)
    });

    this.uploadService.validateHistory(objectSet).subscribe( (answer: any) => {          
      this.filesValidate = answer;
      
      this.filesValidate.forEach(element => {        
        if (element.status == true) {
          // fecha del archivo
          let dateFile = this.datePipe.transform(element.historial.fecha_carga, 'yyyy-MM-dd');
          let dateVal = moment(dateFile);   
          let DiasDiferencia =  myDate.diff(dateVal, 'days');

          if (DiasDiferencia > 15) {
            element.msg = "Este archivo no se puede cargar, excede los 15 dias permitidos";
            Icontinuar = false;
          }else{
            element.msg = "Si carga este archivo, sobre-escribiria la informacion ya cargada";
          }
        }
        else{
          element.msg = "OK";
        }
      });

      if (Icontinuar) {
        this.continuar = true;
      }

    });  
   

    this.openModal(template);
    var modal = document.getElementsByClassName("modal-dialog");
    modal[0].className += " modal-lg"; 
  }

  // invoca el servicio para subir los archivos
  uploadFiles(template: TemplateRef<any>): void {
    this.message = '';
    this.confirmacion = false;
    this.load = true ;
    this.uploadService.uploadFiles(this.files, String(this.idempresaSeleccionada)).subscribe(
      event => {        
        this.fileInfos = this.uploadService.getFiles();                
        if(event instanceof HttpResponse){          
          if (event.body != null) {
            this.serviceResponse = event.body;               
            this.load = false ;
          }          
        }
      },
      err => {
        console.log(err);    
      });        
  }

  //  añade archivos a la lista a cargar
  prepareFilesList(files: Array<any>) {
    
    this.uploadService.getFormatsByCompany(this.idempresaSeleccionada).subscribe( (format: any) => {           
      this.formats = format;
      
      for (const item of files) {      
        let frm = item.name.split("-", 2)[1];     
        
        if (this.formats.some((i: any) => i.cod_formato == frm)) {
          item.progress = 0;
          this.files.push(item);  
        }else{
          this.toastr.warning('El formato ' + item.name + ' no es admitido.', '', {
            timeOut: 3000,
          });
          
        }        
      }
    });   
  }

  // elimina un archivo de la lista a cargar
  deleteFile(index: number) {    
    this.files.splice(index, 1);
  }

  // añade los archivos arrastrados
  onFileDropped($event: any) {
    this.prepareFilesList($event.target.files);
  }

    // agrega los archivos arrastrados a la lista de archivos por cargar
  fileBrowseHandler(event: any) {
    this.prepareFilesList(event.target.files);
  }

  // limpia la lista de archivos a cargar 
  cleanFiles(file1: any, file2: any){    
    file1.value = [];
    file2.value = [];
    this.files = [] ;
    this.formats = [];
  }

  // sleecciona la empresa desde un desplegable
  loadCompany(sui: any, nit: any, file1: any, file2: any){
    sui.value = '';
    nit.value = '';
    
    this.cleanFiles(file1, file2)
    this.formatosPermitidos = '';
    this.empresaSeleccionada = ' ';
    this.idempresaSeleccionada = 0;

    let empresa = this.businnes.find(f => f.cod_empresa ==  this.opcionSeleccionado[0].cod_empresa);
    if (empresa != null) {
      this.empresaSeleccionada = empresa.nombre_empresa ;    
      this.idempresaSeleccionada = empresa.id_empresa ;   
      
      // traer los formatos por empresa
      this.formatsByCompany(empresa.id_empresa); 
    }   
    console.log(this.opcionSeleccionado);
    this.activeSelect(file1, file2);
  }

  // cuando se deselecciona un campo
  onDeSelect(sui: any, nit: any, file1: any, file2: any){
    sui.value = '';
    nit.value = '';
    
    this.cleanFiles(file1, file2)
    this.formatosPermitidos = '';
    this.empresaSeleccionada = ' ';
    this.idempresaSeleccionada = 0;
    
    this.activeSelect(file1, file2);
  }
  
  // selecciona la empresa por codigo sui
  loadCompanysui(sui: any, nit: any, file1: any, file2: any): void {    
    nit.value = '';

    this.cleanFiles(file1, file2)
    this.formatosPermitidos = '';
    this.empresaSeleccionada = ' ';
    this.opcionSeleccionado = [];
    this.idempresaSeleccionada = 0;

    let empresa = this.businnes.find(f => f.cod_sui_empresa == sui.value);
    
    if(empresa != null && sui.value != ''){
      this.empresaSeleccionada = empresa.nombre_empresa ;      
      this.idempresaSeleccionada = empresa.id_empresa ;    
      this.opcionSeleccionado.push(empresa);        
      console.log(this.opcionSeleccionado);
      // traer los formatos por empresa
      this.formatsByCompany(empresa.id_empresa); 
    }

    this.activeSelect();
  }

  // selecciona la empresa por su nit
  loadCompanynit(sui: any, nit: any, file1: any, file2: any): void {
    sui.value = '';

    this.cleanFiles(file1, file2)
    this.formatosPermitidos = '';
    this.empresaSeleccionada = ' ';
    this.opcionSeleccionado = [];
    this.idempresaSeleccionada = 0;

    let empresa = this.businnes.find(f => f.nit_empresa == nit.value);
  
    if(empresa != null && nit.value != ''){
      this.empresaSeleccionada = empresa.nombre_empresa ;  
      this.idempresaSeleccionada = empresa.id_empresa ;     
      this.opcionSeleccionado.push(empresa);         
      
      // traer los formatos por empresa
      this.formatsByCompany(empresa.id_empresa); 
    }

    this.activeSelect();
  }

  // activa el input para el cargue de los archivos
  activeSelect(file1?: any, file2?: any){    
    if(this.idempresaSeleccionada != 0){
      this.disabled = false ;
    }else{
      this.disabled = true ;
      if (file1 != null || file2 != null) {
        this.cleanFiles(file1, file2)  
      }
      
    }
    
  }

  // muestra una ventana modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modal.show(template);
  }

  //refrresca la pagina
  refresh(sui: any, nit: any, file1?: any, file2?: any){
    file1.value = [];
    file2.value = [];

    // campos de filtro
    sui.value = '';
    nit.value = '';
    this.opcionSeleccionado = [];
    this.empresaSeleccionada = ' ' ;
    this.formatosPermitidos = ' ';
    this.message = '';
    this.idempresaSeleccionada = 0;

    this.files = [] ;
    this.formats = [];
    this.serviceResponse = [];

    //banderas
    this.confirmacion = true;
    this.disabled = true;
    this.load = false;
    this.continuar = false;
  }
}