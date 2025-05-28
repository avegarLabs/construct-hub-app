import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faKaaba, faHelmetSafety, faTruck } from '@fortawesome/free-solid-svg-icons';

interface MenuOptions {
  icon: string;
  label: string;
  subLabel: string;
  route: string;
}

@Component({
  selector: 'app-side-menu-options',
  imports: [RouterLink, FontAwesomeModule, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {
  private iconLibrary = inject(FaIconLibrary);
  constructor() {
    this.iconLibrary.addIcons(faKaaba, faHelmetSafety, faTruck);
  }

  menuOptions: MenuOptions[] = [
    {
      icon: 'faKaaba',
      label: 'Obras',
      subLabel: 'Gestión de Obras',
      route: '/dashboard/works',
    },
    {
      icon: 'helmet-safety',
      label: 'Empresas',
      subLabel: 'Listado Empresas',
      route: '/dashboard/enterprise',
    },
    //<i class="fa-solid fa-truck-fast"></i>
    {
      icon: 'truck',
      label: 'Despachos',
      subLabel: 'Salida de Recursos',
      route: '/dashboard/dispatches',
    },
  ];

  getIconName(icon: string) {
    return icon.replace('fa', '').toLowerCase();
  }
}
