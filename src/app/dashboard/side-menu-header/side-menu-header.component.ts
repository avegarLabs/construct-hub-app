import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-side-menu-header',
  imports: [FontAwesomeModule],
  templateUrl: './side-menu-header.component.html',
})
export class SideMenuHeaderComponent {
  private iconLibrary = inject(FaIconLibrary);
  authServ = inject(AuthService);
  user = this.authServ.getUser();
  app: string = environment.appName;
  sub: string = environment.subName;
  slogan: string = environment.label;

  constructor() {
    this.iconLibrary.addIcons(faUser);
  }

  getIconName(icon: string) {
    return icon.replace('fa', '').toLowerCase();
  }
}
