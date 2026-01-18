import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
        <div class="layout-footer">
            {{ appName }}{{ subName }} - {{ label }}
        </div>
    `
})
export class AppFooter {
    appName = environment.appName;
    subName = environment.subName;
    label = environment.label;
}
