import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MenuOptions{
  icon:string; 
  label: string;
  subLabel:string;
  route:string;

}

@Component({
  selector: 'app-side-menu-options',
  imports:[RouterLink],
  templateUrl: './side-menu-options.component.html',
 
})
export class SideMenuOptionsComponent  {
menuOptions:MenuOptions[] = [
  {
    icon: 'fa-solid fa-chart-line',
    label: 'Obras',
    subLabel: 'Gestión de Obras',
    route:'/dashboard/works'
  },
  {
    icon: 'fa-solid fa-chart-line',
    label: 'Empresas',
    subLabel: 'Listado Empresas',
    route:'/dashboard/enterprise'
  },
  {
    icon: 'fa-solid fa-chart-line',
    label: 'Recursos',
    subLabel: 'Listado de Recursos',
    route:'/dashboard/resources'
  },
  {
    icon: 'fa-solid fa-chart-line',
    label: 'Despachos',
    subLabel: 'Salida de Recursos',
    route:'/dashboard/dispatches'
  },

]

}
