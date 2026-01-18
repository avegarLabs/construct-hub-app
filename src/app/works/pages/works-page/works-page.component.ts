import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorksService } from '../../services/works.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { WorksListItem } from '../../interfaces/works-interface';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddWorkComponent } from '../../components/add-work/add-work.component';

@Component({
    selector: 'app-works-page',
    standalone: true,
    imports: [CommonModule, WordCardComponent, ButtonModule],
    providers: [DialogService],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold m-0">Listado de Obras</h2>
                <p-button
                    label="Agregar Obra"
                    icon="pi pi-plus"
                    (onClick)="openModal(null)">
                </p-button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                @for (item of workService.list(); track item.id) {
                    <app-word-card [worksItem]="item" />
                }
            </div>
        </div>
    `
})
export default class WorksPageComponent {
    workService = inject(WorksService);
    private dialogService = inject(DialogService);
    private ref: DynamicDialogRef | undefined;

    openModal(item: WorksListItem | null): void {
        this.ref = this.dialogService.open(AddWorkComponent, {
            header: item ? 'Editar Obra' : 'Agregar Obra',
            width: '500px',
            modal: true,
            data: { model: item }
        });
    }
}
