import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { EnterpriseService } from '../../../enterprises/services/enterprise.service';

@Component({
    selector: 'app-add-empesas-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule],
    template: `
        <div class="flex flex-col gap-4">
            <div class="max-h-80 overflow-y-auto flex flex-col gap-2">
                @for (enterprise of empService.list(); track enterprise.id) {
                    <div
                        class="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
                        (click)="toggleSelection(enterprise.id)">
                        <div class="flex items-center gap-3">
                            <p-checkbox
                                [ngModel]="selectedIds().includes(enterprise.id)"
                                [binary]="true"
                                (ngModelChange)="toggleSelection(enterprise.id)">
                            </p-checkbox>
                            <div>
                                <span class="font-medium">{{ enterprise.nombre }}</span>
                                <span class="text-surface-500 ml-2">({{ enterprise.codigo }})</span>
                            </div>
                        </div>
                    </div>
                }

                @if (empService.list().length === 0) {
                    <div class="text-center py-6 text-surface-500">
                        No hay empresas disponibles
                    </div>
                }
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancel()">
                </p-button>
                <p-button
                    label="Agregar"
                    icon="pi pi-plus"
                    [disabled]="selectedIds().length === 0"
                    (onClick)="confirm()">
                </p-button>
            </div>
        </div>
    `
})
export class AddEmpesasModalComponent {
    private dialogRef = inject(DynamicDialogRef);
    empService = inject(EnterpriseService);

    selectedIds = signal<number[]>([]);

    toggleSelection(id: number) {
        const current = this.selectedIds();
        if (current.includes(id)) {
            this.selectedIds.set(current.filter(x => x !== id));
        } else {
            this.selectedIds.set([...current, id]);
        }
    }

    confirm() {
        this.dialogRef.close(this.selectedIds());
    }

    cancel() {
        this.dialogRef.close();
    }
}
