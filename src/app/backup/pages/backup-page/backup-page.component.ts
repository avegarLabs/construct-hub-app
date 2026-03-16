import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BackupService, BackupHistoryEntry } from '../../services/backup.service';
import { ConfirmationService } from '../../../share/confirmation.service';

@Component({
    selector: 'app-backup-page',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        ButtonModule,
        TableModule,
        TagModule,
        ProgressSpinnerModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right"></p-toast>

        <div class="card">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold mb-1">Respaldo de Base de Datos</h2>
                    <p class="text-surface-500 dark:text-surface-400 text-sm">
                        Genere y descargue una copia de seguridad completa del sistema
                    </p>
                </div>
            </div>

            <!-- Main Action Card -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
                <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Left: Action area -->
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                                <i class="pi pi-database text-blue-500 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold">Backup Completo</h3>
                                <p class="text-surface-500 dark:text-surface-400 text-sm">
                                    PostgreSQL - Formato comprimido (.backup)
                                </p>
                            </div>
                        </div>

                        <p class="text-surface-600 dark:text-surface-300 text-sm mb-5 leading-relaxed">
                            Este proceso genera un respaldo completo de la base de datos incluyendo todas las obras,
                            empresas, recursos, despachos, vales y configuraciones del sistema. El archivo se descarga
                            en formato nativo de PostgreSQL comprimido con zlib.
                        </p>

                        <div class="flex flex-wrap items-center gap-3">
                            <p-button
                                [label]="backupService.isDownloading() ? 'Generando Backup...' : 'Descargar Backup'"
                                [icon]="backupService.isDownloading() ? 'pi pi-spin pi-spinner' : 'pi pi-download'"
                                severity="info"
                                [disabled]="backupService.isDownloading()"
                                (onClick)="onDownloadBackup()">
                            </p-button>

                            @if (backupService.lastBackup()) {
                                <span class="text-sm text-surface-500 dark:text-surface-400">
                                    <i class="pi pi-check-circle text-green-500 mr-1"></i>
                                    Ultimo respaldo: {{ backupService.lastBackup()!.date | date:'dd/MM/yyyy HH:mm' }}
                                </span>
                            }
                        </div>
                    </div>

                    <!-- Right: Info panel -->
                    <div class="lg:w-80 bg-surface-50 dark:bg-surface-800 rounded-lg p-4 border border-surface-100 dark:border-surface-700">
                        <h4 class="font-semibold text-sm mb-3 flex items-center gap-2">
                            <i class="pi pi-info-circle text-blue-500"></i>
                            Informacion Importante
                        </h4>
                        <ul class="text-sm text-surface-600 dark:text-surface-300 space-y-2">
                            <li class="flex items-start gap-2">
                                <i class="pi pi-chevron-right text-xs mt-1 text-surface-400"></i>
                                <span>El respaldo incluye <strong>todos los datos</strong> del sistema</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="pi pi-chevron-right text-xs mt-1 text-surface-400"></i>
                                <span>El archivo se descarga automaticamente al navegador</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="pi pi-chevron-right text-xs mt-1 text-surface-400"></i>
                                <span>No cierre la ventana mientras se genera el respaldo</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="pi pi-chevron-right text-xs mt-1 text-surface-400"></i>
                                <span>Guarde el archivo en un lugar seguro</span>
                            </li>
                        </ul>

                        <div class="mt-4 pt-3 border-t border-surface-200 dark:border-surface-600">
                            <h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
                                <i class="pi pi-refresh text-orange-500"></i>
                                Restaurar
                            </h4>
                            <p class="text-xs text-surface-500 dark:text-surface-400 leading-relaxed font-mono bg-surface-100 dark:bg-surface-900 rounded p-2">
                                pg_restore -h host -p 5432 -U usuario -d nombre_bd archivo.backup
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- History Table -->
            @if (backupService.history().length > 0) {
                <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
                        <h3 class="font-semibold flex items-center gap-2">
                            <i class="pi pi-history text-surface-500"></i>
                            Historial de Respaldos
                        </h3>
                        <p-button
                            label="Limpiar Historial"
                            icon="pi pi-trash"
                            severity="secondary"
                            [outlined]="true"
                            size="small"
                            (onClick)="onClearHistory()">
                        </p-button>
                    </div>
                    <p-table
                        [value]="backupService.history()"
                        styleClass="p-datatable-striped"
                        [paginator]="backupService.history().length > 5"
                        [rows]="5"
                        [showCurrentPageReport]="true"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} respaldos">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Archivo</th>
                                <th>Fecha</th>
                                <th>Tamano</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-entry>
                            <tr>
                                <td class="font-medium">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-file text-blue-500"></i>
                                        {{ entry.filename }}
                                    </div>
                                </td>
                                <td>{{ entry.date | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                                <td>
                                    <p-tag [value]="formatSize(entry.sizeBytes)" severity="info"></p-tag>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            }
        </div>
    `
})
export default class BackupPageComponent {
    backupService = inject(BackupService);
    private confirmService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    onDownloadBackup(): void {
        this.confirmService
            .confirm(
                'Generar Respaldo',
                'Se generara un respaldo completo de la base de datos. Este proceso puede demorar dependiendo del volumen de datos. ¿Desea continuar?'
            )
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.executeBackup();
                }
            });
    }

    onClearHistory(): void {
        this.confirmService
            .confirm('Limpiar Historial', '¿Esta seguro de eliminar el historial de respaldos? Esta accion no afecta los archivos ya descargados.')
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.backupService.clearHistory();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Historial Limpiado',
                        detail: 'El historial de respaldos ha sido eliminado'
                    });
                }
            });
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    private executeBackup(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Generando Respaldo',
            detail: 'Se esta generando el backup de la base de datos...',
            life: 10000
        });

        this.backupService.downloadBackup().subscribe({
            next: ({ filename }) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Respaldo Completado',
                    detail: `El archivo "${filename}" se ha descargado correctamente`,
                    life: 5000
                });
            },
            error: (err) => {
                let detail = 'No se pudo generar el respaldo. Intente nuevamente.';
                if (err.status === 401 || err.status === 403) {
                    detail = 'No tiene permisos para realizar esta operacion.';
                } else if (err.status === 0) {
                    detail = 'No se pudo conectar con el servidor. Verifique su conexion.';
                } else if (err.status >= 500) {
                    detail = 'Error interno del servidor al generar el respaldo. Contacte al administrador.';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en el Respaldo',
                    detail,
                    life: 8000
                });
            }
        });
    }
}
