import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuHeaderComponent } from "../side-menu-header/side-menu-header.component";
import { SideMenuOptionsComponent } from "../side-menu-options/side-menu-options.component";

@Component({
  imports: [RouterOutlet, SideMenuHeaderComponent, SideMenuOptionsComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export default class DashboardComponent {

}
