import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKaaba } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WorksListItem } from '../../interfaces/works-interface';
import { AddWorkComponent } from '../add-work/add-work.component';
import { WorksService } from '../../services/works.service';
import { ConfirmationService } from '../../../share/confirmation.service';

@Component({
    selector: 'app-word-card',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, RouterLink, ButtonModule],
    providers: [DialogService],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-6 flex flex-col items-center shadow-sm">
            <div class="mb-4 text-surface-500">
                <fa-icon [icon]="faKaaba" class="text-6xl"></fa-icon>
            </div>

            <h5 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-1 text-center">
                {{ worksItem().codigo }}
            </h5>
            <span class="text-sm text-surface-600 dark:text-surface-400 mb-4 text-center">
                {{ worksItem().descripcion }}
            </span>

            <div class="flex flex-col sm:flex-row gap-2 w-full">
                <a [routerLink]="['/dashboard/works', worksItem().id]" class="flex-1">
                    <p-button
                        label="Ver"
                        icon="pi pi-eye"
                        severity="success"
                        [outlined]="true"
                        styleClass="w-full">
                    </p-button>
                </a>
                <p-button
                    label="Editar"
                    icon="pi pi-pencil"
                    severity="info"
                    [outlined]="true"
                    (onClick)="openModal(worksItem())"
                    styleClass="flex-1">
                </p-button>
                <p-button
                    label="Eliminar"
                    icon="pi pi-trash"
                    severity="danger"
                    [outlined]="true"
                    (onClick)="removeObra(worksItem())"
                    styleClass="flex-1">
                </p-button>
            </div>
        </div>
    `
})
export class WordCardComponent {
    private workService = inject(WorksService);
    private dialogService = inject(DialogService);
    private confServ = inject(ConfirmationService);
    private ref: DynamicDialogRef | undefined;

    worksItem = input.required<WorksListItem>();

    faKaaba = faKaaba;

    openModal(item: WorksListItem): void {
        this.ref = this.dialogService.open(AddWorkComponent, {
            header: 'Editar Obra',
            width: '500px',
            modal: true,
            data: { model: item }
        });
    }

    removeObra(item: WorksListItem): void {
        this.confServ
            .confirm('Eliminar Obra', `¿Esta seguro de eliminar la obra "${item.codigo}"?`)
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.workService.removeWorks(item.id);
                }
            });
    }
}
