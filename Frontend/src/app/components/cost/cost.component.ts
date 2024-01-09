import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CostService } from '../../services/cost.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormatService } from 'src/app/services/format.service';


@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html'
})
export class CostComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;

  // edc a editar
  selected: any = { } ;

  // guarda una lista de tods los edc
  edcs: any[] = []; 

  // mensaje confirmacion actualizacion de estado
  estadoEdc = '';  

  // trae una lista de formatos
  formatos: any[] = [];

  // trae una lista de formatos edc
  edcFormatos: any[] = [];

   // bandera para cortinilla
   awaiting = true;

  // constructor 
  constructor(private costService: CostService,
              private formatService: FormatService) {
    // this.getEdcFormat();
    this.getFormats();
    this.getEdc(); 
  }

  // trae los edcs
  getEdc(){    
    this.costService.getEdc().subscribe( (edc: any) => {      
      this.edcs = edc;    

      if (edc.length == this.edcs.length) {
        this.awaiting = false;
      }
     });     
  }

  // trae el listado de todos los formatos
  getFormats(){
    this.costService.getEdcFormat().subscribe( (formats: any) => {         
      this.formatos = formats; 
    });        
  }

  // trae el listado de relaciones existentes entre formatos y edc
  getEdcFormat(){
    this.costService.getEdcFormat().subscribe( (formats: any) => {         
      this.edcFormatos = formats; 
    });        
  }


  // edc seleccionada para ser editada
  edcSelected(id: any){
    this.selected = this.edcs.find(element => element.id_edc == id); 
  }
}
