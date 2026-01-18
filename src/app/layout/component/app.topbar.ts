import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/dashboard">
                    <i class="pi pi-bolt text-primary" style="font-size: 2rem;"></i>
                    <span>{{ appName }}<span class="text-primary">{{ subName }}</span></span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action" *ngIf="username">
                            <i class="pi pi-user"></i>
                            <span>{{ username }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    private authService = inject(AuthService);

    appName = environment.appName;
    subName = environment.subName;

    get username(): string | null {
        const user = this.authService.getUser();
        return user?.sub || null;
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
