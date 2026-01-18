import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-resources-page',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <h2 class="text-2xl font-bold mb-6">Gestión de Recursos</h2>
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
                <p class="text-surface-600 dark:text-surface-400">
                    Los recursos se gestionan desde cada obra específica.
                </p>
            </div>
        </div>
    `
})
export default class ResourcesPageComponent {}
