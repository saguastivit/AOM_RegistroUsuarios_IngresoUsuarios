import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UsersService } from 'src/app/services/users.service'; 


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent {
  // modelo de referencia para modales
  modalRef: BsModalRef = new  BsModalRef;  

  // guarda una lista de todas las empresas permitidas
  users: any[] = [];   

  // guarda una lsita de roles
  rols: any[]= [];
  
  // guarda la empresa a trabajar o crear
  selected: any = { };
  
  // bandera para cortinilla
  awaiting = true;

  constructor(private usersService: UsersService) {
    this.getRols();  
   }

  // usuario seleccionada para ser editada
  userSelected(id: any){  
    this.selected = this.users.find(element => element.id_user == id);     
  } 

  // trae las servicios 
  getRols(): void{
    this.usersService.getRols().subscribe( (serv: any) => {         
      this.rols = serv;  
      this.getUsers();
    });      
    
  }

  // carga los usuarios antes de enviarlas a la tabla
  getUsers(){    
    this.usersService.getUsers().subscribe( (data: any) => {         
      this.users = data; 

      this.users.forEach(element => {
        element.nombre_rol = this.rols.find(s => s.id_role == element.id_rol).nombre_rol;
      }); 

      if (data.length == this.users.length) {
        this.awaiting = false;
      }
    });  
  }

}
