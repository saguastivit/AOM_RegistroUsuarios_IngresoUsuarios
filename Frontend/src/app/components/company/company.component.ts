import { Component } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html'
})
export class CompanyComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;  

  // guarda una lista de todas las empresas permitidas
  businnes: any[] = [];   

  // guarda la empresa a trabajar o crear
  selected: any = { };

  // bandera para cortinilla
  awaiting = true;

  // constructor 
  constructor(private companyService: CompanyService) {
              this.getBusiness();
              
  }

  // empresa seleccionada para ser editada
  companySelected(id: any){  
    this.selected = this.businnes.find(element => element.id_empresa == id);     
  } 

  // carga las empresas antes de enviarlas a la tabla
  async getBusiness(){    
    this.companyService.getBusiness().then(
      data => {
        data.forEach((element: any) => {
          this.businnes.push(element);
        });      
        
        if (data.length == this.businnes.length) {
          this.awaiting = false;
        }
      }
    )       
  }


}
