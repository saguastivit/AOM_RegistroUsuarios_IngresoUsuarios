import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ConceptService } from '../../services/concept.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'app-concept',
  templateUrl: './concept.component.html'
})
export class ConceptComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;

  // concepto a editar
  selected: any = { } ;

  // guarda una lista de todss los conceptos
  concepts: any[] = []; 

  // guarda los tipos de conceopto
  conceptsType: any[] = [];

  // guarda los tipo de naturaleza
  conceptsNature: any[] = [];

  // arreglo para capturar los conceptos antes de refactorizar
  refactorizar: any[] = []; 

  // trae una lista de formatos
  formatos: any[] = [];

   // bandera para cortinilla
   awaiting = true;

  // constructor 
  constructor(private conceptService: ConceptService,
              private formatService: FormatService) {
    this.getFormats();
    this.getConcepts();     
    this.getTypeConcepts();
    this.getNatureConcepts();
  }

  // trae el listado de todos los formatos
  getFormats(){
    this.formatService.getFormats().subscribe( (formats: any) => {         
      this.formatos = formats; 
    });        
  }

  // trae los tipos de conceptos
  getTypeConcepts(): void{
    this.conceptService.getTypeConcepts().subscribe( (tpc: any) => {         
      this.conceptsType = tpc;   
    }); 
  }

  // trae las naturalezas de conceptos
  getNatureConcepts(): void{
    this.conceptService.getNatureConcepts().subscribe( (ntr: any) => {         
      this.conceptsNature = ntr;   
    }); 
  }

  // trae los conceptos
  getConcepts(): void{
    this.conceptService.getConcepts().subscribe( (conceptos: any) => {      
      // this.conceptos = conceptos;     

      for (let index = 0; index < conceptos.length; index++) {
        if (!conceptos[index]["$ref"]) {
          this.refactorizar.push(conceptos[index]);
        }        
      } 

      this.refactor(this.refactorizar); 
      
      this.concepts.forEach(element => {
        if (element.id_concepto_padre != null) {
          element.nombre_padre = this.concepts.find(c => c.id_concepto == element.id_concepto_padre).cod_concepto;
  
        }else{
          element.nombre_padre = '00000000'
        }
       });

       if (conceptos.length == this.concepts.length) {
        this.awaiting = false;
      }

     });
     
     this.concepts.sort();
  }

  // refactorizar conceptos
  refactor(conceptos: any){   
    let conceptosPro: any = [];
    conceptosPro = conceptos;    
    
    conceptosPro.forEach((element: { id: never; concepto1: never[]; concepto2: never;}) => {    
      
      if (!element.hasOwnProperty('$ref')) {
        this.concepts.push(element);
      }     
      
      
      if (!element.hasOwnProperty('$ref') && element.concepto1.length > 0) {   
        this.refactor(element.concepto1);                
      }

      if (element.concepto2 != null && !element.concepto2["$ref"]) {           
        let elementM: any[] = [];   
        elementM.push(element.concepto2);
        this.refactor(elementM);     
      }
    });
  }  

  // empresa seleccionada para ser editada
  conceptSelected(id: any){  
    this.selected = this.concepts.find(element => element.id_concepto == id);         
  }
}
