import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faKaaba, faHelmetSafety, faTruck, faClose } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../auth/services/auth.service';

interface MenuOptions {
  icon: string;
  label: string;
  subLabel: string;
  route?: string;
  action?: 'logout';
}

@Component({
  selector: 'app-side-menu-options',
  imports: [RouterLink, FontAwesomeModule, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {
  private iconLibrary = inject(FaIconLibrary);
  auth = inject(AuthService);
  router = inject(Router);
  constructor() {
    this.iconLibrary.addIcons(faKaaba, faHelmetSafety, faTruck, faClose);
  }

  menuOptions: MenuOptions[] = [
    {
      icon: 'faKaaba',
      label: 'Obras',
      subLabel: 'Gestión de Obras',
      route: '/dashboard/works',
    },
     {
      icon: 'truck',
      label: 'Despachos',
      subLabel: 'Salida de Recursos',
      route: '/dashboard/dispatches',
    },
    {
      icon: 'helmet-safety',
      label: 'Empresas',
      subLabel: 'Listado Empresas',
      route: '/dashboard/enterprise',
    },
     {
    icon: 'faClose',
    label: 'Salir',
    subLabel: 'Cerrar sesión',
    route: null, 
    action: 'logout' 
  }
  ];

  logout() {
  this.auth.logout();
  this.router.navigate(['/login']);
}

  getIconName(icon: string) {
    return icon.replace('fa', '').toLowerCase();
  }
}
