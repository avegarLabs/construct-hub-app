import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EnterpriseListItem } from '../../interfaces/enterprise-interface';
import { ConfirmationService } from '../../../share/confirmation.service';

@Component({
    selector: 'enterprise-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h3 class="text-xl font-bold mb-6">Empresas Constructoras</h3>

            <p-table
                [value]="enterprises()"
                [tableStyle]="{ 'min-width': '50rem' }"
                styleClass="p-datatable-striped"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empresas">
                <ng-template pTemplate="header">
                    <tr>
                        <th>REUP</th>
                        <th>Nombre</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td>{{ item.codigo }}</td>
                        <td>{{ item.nombre }}</td>
                        <td class="text-center">
                            <div class="flex justify-center gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    severity="info"
                                    [outlined]="true"
                                    [rounded]="true"
                                    (onClick)="onEdit(item.id)">
                                </p-button>
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [outlined]="true"
                                    [rounded]="true"
                                    (onClick)="onDelete(item)">
                                </p-button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="3" class="text-center py-8 text-surface-500">
                            No hay empresas registradas
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export default class ListComponent {
    enterprises = input.required<EnterpriseListItem[]>();
    deleteEnterprise = output<number>();
    editEnterprise = output<number>();

    private confServ = inject(ConfirmationService);

    onDelete(emp: EnterpriseListItem): void {
        this.confServ
            .confirm('Eliminar Empresa', `¿Esta seguro de eliminar la empresa "${emp.codigo}"?`)
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.deleteEnterprise.emit(emp.id);
                }
            });
    }

    onEdit(id: number): void {
        this.editEnterprise.emit(id);
    }
}
