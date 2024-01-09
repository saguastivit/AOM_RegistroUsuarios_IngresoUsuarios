import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-formats',
  templateUrl: './formats.component.html'
})
export class FormatsComponent  {
  
   // modelo de referencia para modales
   modalRef: BsModalRef = new  BsModalRef;  

   // guarda una lista de todas las empresas permitidas
   formats: any[] = [];   
 
   // guarda la empresa a trabajar o crear
   selected: any = { };
   
   // bandera para cortinilla
   awaiting = true;

  constructor(private formatService: FormatService) { 
    this.getFormats();  
  }

  // formato seleccionada para ser editada
  formatSelected(id: any){  
    this.selected = this.formats.find(element => element.id_formato == id);     
  }   

  // trae las servicios 
  getFormats(): void{
    this.formatService.getFormats().subscribe( (formats: any) => {         
      this.formats = formats;  

      if (formats.length == this.formats.length) {
        this.awaiting = false;
      }
    });      
    
  }

}
