import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DispatchReportService } from '../../services/dispatch-report.service';

@Component({
    selector: 'app-item-dispatches-modal',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule],
    template: `
        <div class="flex flex-col gap-4">
            <p-table
                [value]="data?.items?.despachos || []"
                [tableStyle]="{ 'min-width': '40rem' }"
                styleClass="p-datatable-striped">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Recurso</th>
                        <th>Descripción</th>
                        <th>U/M</th>
                        <th>Cantidad</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td class="font-medium">{{ item.recurso?.codigo }}</td>
                        <td>{{ item.recurso?.descripcion }}</td>
                        <td>{{ item.recurso?.um }}</td>
                        <td>{{ item.cantidadDespachada }}</td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center py-4 text-surface-500">
                            No hay recursos en este despacho
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <p-button
                    label="Vale PDF"
                    icon="pi pi-file-pdf"
                    severity="success"
                    [outlined]="true"
                    (onClick)="printVale()">
                </p-button>
                <p-button
                    label="Cerrar"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancel()">
                </p-button>
            </div>
        </div>
    `
})
export class ItemDispatchesModalComponent {
    private dialogRef = inject(DynamicDialogRef);
    private config = inject(DynamicDialogConfig);
    private reportServ = inject(DispatchReportService);

    get data() {
        return this.config.data;
    }

    cancel() {
        this.dialogRef.close();
    }

    printVale() {
        this.reportServ.generateValeReport(this.data.items);
    }
}
