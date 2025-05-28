import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-side-menu-header',
  templateUrl: './side-menu-header.component.html'
})
export class SideMenuHeaderComponent {

  app:string = environment.appName;
  sub:string = environment.subName;
  slogan:string = environment.label;

}
