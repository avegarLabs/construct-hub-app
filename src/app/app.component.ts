import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, ConfirmDialogModule, ToastModule],
    template: `
        <router-outlet></router-outlet>
        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>
    `
})
export class AppComponent {
    title = 'construct-hub-app';
}
