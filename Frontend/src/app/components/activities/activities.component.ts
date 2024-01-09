import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html'
})
export class ActivitiesComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;  

  // guarda una lista de todas las empresas permitidas
  activities: any[] = [];   

  // guarda una lsita de servicios
  services: any[]= [];
  
  // guarda la empresa a trabajar o crear
  selected: any = { };
  
  // bandera para cortinilla
  awaiting = true;

  constructor(private activityService: ActivityService) {
    this.getServices();  
   }

  // actividad seleccionada para ser editada
  activitySelected(id: any){  
    this.selected = this.activities.find(element => element.id_actividad == id);     
  } 

  // trae las servicios 
  getServices(): void{
    this.activityService.getServices().subscribe( (serv: any) => {         
      this.services = serv;  
      this.getActivities();
    });      
    
  }

  // carga las actividades antes de enviarlas a la tabla
  getActivities(){    
    this.activityService.getActivities().subscribe( (data: any) => {         
      this.activities = data; 

      this.activities.forEach(element => {
        element.nombre_servicio = this.services.find(s => s.id_servicio == element.id_servicio).nombre_servicio;
      }); 

      if (data.length == this.activities.length) {
        this.awaiting = false;
      }
    });  
  }

}
