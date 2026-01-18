import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ResourceService } from '../../../resources/services/resource.service';
import { ImportResultDTO } from '../../interfaces/import-result.interface';

@Component({
    selector: 'app-import-resources-modal',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FileUploadModule,
        ProgressBarModule,
        MessageModule,
        TableModule
    ],
    template: `
        <div class="flex flex-col gap-4">
            @if (uploadState() === 'initial') {
                <div class="flex flex-col gap-4">
                    <p class="text-surface-600 dark:text-surface-400">
                        Seleccione un archivo Excel (.xlsx o .xls) con la siguiente estructura:
                    </p>

                    <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 bg-surface-50 dark:bg-surface-900">
                        <h4 class="font-semibold mb-2">Formato esperado:</h4>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li><strong>Columna 1:</strong> Código (requerido, único)</li>
                            <li><strong>Columna 2:</strong> Descripción (requerido)</li>
                            <li><strong>Columna 3:</strong> U/M (requerido)</li>
                            <li><strong>Columna 4:</strong> Cantidad (requerido, numérico)</li>
                            <li><strong>Columna 5:</strong> Precio (opcional, numérico)</li>
                        </ul>
                    </div>

                    <p-fileUpload
                        mode="basic"
                        chooseLabel="Seleccionar archivo"
                        accept=".xlsx,.xls"
                        [maxFileSize]="10000000"
                        [auto]="false"
                        (onSelect)="onFileSelect($event)"
                        [customUpload]="true">
                    </p-fileUpload>

                    @if (selectedFile()) {
                        <div class="flex items-center gap-2 p-3 border border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <i class="pi pi-file-excel text-green-600"></i>
                            <span class="font-medium">{{ selectedFile()?.name }}</span>
                            <span class="text-sm text-surface-500">
                                ({{ (selectedFile()?.size! / 1024).toFixed(2) }} KB)
                            </span>
                        </div>
                    }

                    <div class="flex justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
                        <p-button
                            label="Descargar Plantilla"
                            icon="pi pi-download"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="downloadTemplate()">
                        </p-button>

                        <div class="flex gap-2">
                            <p-button
                                label="Cancelar"
                                severity="secondary"
                                [outlined]="true"
                                (onClick)="cancel()">
                            </p-button>
                            <p-button
                                label="Importar"
                                icon="pi pi-upload"
                                [disabled]="!selectedFile()"
                                (onClick)="uploadFile()">
                            </p-button>
                        </div>
                    </div>
                </div>
            }

            @if (uploadState() === 'uploading') {
                <div class="flex flex-col items-center gap-4 py-8">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                    <p class="text-lg font-medium">Procesando archivo...</p>
                    <p class="text-sm text-surface-500">Por favor espere mientras importamos los recursos</p>
                </div>
            }

            @if (uploadState() === 'completed') {
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-3 p-4 border border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <i class="pi pi-check-circle text-3xl text-green-600"></i>
                        <div>
                            <h3 class="font-semibold text-lg">Importación completada</h3>
                            <p class="text-sm text-surface-600 dark:text-surface-400">
                                {{ importResult()?.successfulRows }} de {{ importResult()?.totalRows }} recursos importados exitosamente
                            </p>
                        </div>
                    </div>

                    @if (importResult()?.failedRows && importResult()!.failedRows > 0) {
                        <div class="flex flex-col gap-2">
                            <h4 class="font-semibold text-red-600">
                                <i class="pi pi-exclamation-triangle mr-2"></i>
                                Errores encontrados ({{ importResult()?.failedRows }})
                            </h4>

                            <p-table
                                [value]="importResult()?.errors || []"
                                [scrollable]="true"
                                scrollHeight="300px"
                                styleClass="p-datatable-sm">
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th style="width: 80px">Fila</th>
                                        <th style="width: 120px">Código</th>
                                        <th>Error</th>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="body" let-error>
                                    <tr>
                                        <td>{{ error.rowNumber }}</td>
                                        <td>{{ error.codigo || '-' }}</td>
                                        <td class="text-red-600">{{ error.message }}</td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>
                    }

                    <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                        <p-button
                            label="Importar otro archivo"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="reset()">
                        </p-button>
                        <p-button
                            label="Cerrar"
                            (onClick)="close()">
                        </p-button>
                    </div>
                </div>
            }

            @if (uploadState() === 'error') {
                <div class="flex flex-col items-center gap-4 py-8">
                    <i class="pi pi-times-circle text-4xl text-red-600"></i>
                    <h3 class="text-lg font-semibold">Error en la importación</h3>
                    <p class="text-sm text-surface-600 dark:text-surface-400 text-center">
                        {{ errorMessage() }}
                    </p>
                    <div class="flex gap-2">
                        <p-button
                            label="Reintentar"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="reset()">
                        </p-button>
                        <p-button
                            label="Cerrar"
                            (onClick)="cancel()">
                        </p-button>
                    </div>
                </div>
            }
        </div>
    `
})
export class ImportResourcesModalComponent {
    private dialogRef = inject(DynamicDialogRef);
    private config = inject(DynamicDialogConfig);
    private resourceServ = inject(ResourceService);

    uploadState = signal<'initial' | 'uploading' | 'completed' | 'error'>('initial');
    selectedFile = signal<File | null>(null);
    importResult = signal<ImportResultDTO | null>(null);
    errorMessage = signal<string>('');

    get workId(): number {
        return this.config.data?.workId;
    }

    onFileSelect(event: any) {
        const file = event.files[0];
        if (file) {
            this.selectedFile.set(file);
        }
    }

    uploadFile() {
        const file = this.selectedFile();
        if (!file) return;

        this.uploadState.set('uploading');

        this.resourceServ.importResourcesFromExcel(this.workId, file).subscribe({
            next: (result) => {
                this.importResult.set(result);
                this.uploadState.set('completed');
            },
            error: (error) => {
                console.error('Error importing resources:', error);
                this.errorMessage.set(
                    error.status === 400
                        ? 'Archivo inválido. Verifique el formato y los datos.'
                        : 'Error en el servidor. Por favor intente nuevamente.'
                );
                this.uploadState.set('error');
            }
        });
    }

    downloadTemplate() {
        this.resourceServ.downloadTemplate().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'plantilla_recursos.xlsx';
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('Error downloading template:', error);
            }
        });
    }

    reset() {
        this.uploadState.set('initial');
        this.selectedFile.set(null);
        this.importResult.set(null);
        this.errorMessage.set('');
    }

    close() {
        this.dialogRef.close(this.importResult()?.successfulRows! > 0);
    }

    cancel() {
        this.dialogRef.close();
    }
}
