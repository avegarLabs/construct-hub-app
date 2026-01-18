import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../auth/services/auth.service';
import { faKaaba, faTruck, faHelmetSafety, faCubes, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    model: MenuItem[] = [];

    // FontAwesome icons
    faKaaba = faKaaba;
    faTruck = faTruck;
    faHelmetSafety = faHelmetSafety;
    faCubes = faCubes;
    faRightFromBracket = faRightFromBracket;

    ngOnInit(): void {
        this.model = [
            {
                label: 'Menu',
                items: [
                    {
                        label: 'Obras',
                        icon: 'pi pi-fw pi-building',
                        faIcon: this.faKaaba,
                        routerLink: ['/dashboard/works']
                    },
                    {
                        label: 'Despachos',
                        icon: 'pi pi-fw pi-truck',
                        faIcon: this.faTruck,
                        routerLink: ['/dashboard/dispatches']
                    },
                    {
                        label: 'Empresas',
                        icon: 'pi pi-fw pi-users',
                        faIcon: this.faHelmetSafety,
                        routerLink: ['/dashboard/enterprise']
                    }
                ]
            },
            {
                label: 'Cuenta',
                items: [
                    {
                        label: 'Cerrar Sesion',
                        icon: 'pi pi-fw pi-sign-out',
                        faIcon: this.faRightFromBracket,
                        command: () => this.logout()
                    }
                ]
            }
        ];
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
