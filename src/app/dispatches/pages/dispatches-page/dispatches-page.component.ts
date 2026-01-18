import { Component, effect, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DispatchesService } from '../../services/dispatches.service';
import { ItemDispatchesModalComponent } from '../../components/item-dispatches-modal/item-dispatches-modal.component';
import { DespachoListItem, DispatcheListItem } from '../../interfaces/dispatches-iterface';
import { DispatchesModalComponent } from '../../components/dispatches-modal/dispatches-modal.component';
import { WorksService } from '../../../works/services/works.service';
import { ObjectService } from '../../../works/objects/services/object.service';
import { WorksListItem } from '../../../works/interfaces/works-interface';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { ConfirmationService } from '../../../share/confirmation.service';
import { DispatchReportService } from '../../services/dispatch-report.service';
import { TimeReportModalComponent } from '../../components/time-report-modal/time-report-modal.component';

@Component({
    selector: 'app-dispatches-page',
    standalone: true,
    imports: [CommonModule, DatePipe, FormsModule, TableModule, ButtonModule, SelectModule, InputTextModule],
    providers: [DialogService],
    template: `
        <div class="card">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 class="text-2xl font-bold">Despachos Realizados</h2>
                <div class="flex flex-wrap gap-2 mt-4 md:mt-0">
                    <p-button
                        label="Despachos PDF"
                        icon="pi pi-file-pdf"
                        severity="success"
                        [outlined]="true"
                        (onClick)="controlDespachos()">
                    </p-button>
                    <p-button
                        label="Crear Despacho"
                        icon="pi pi-plus"
                        severity="info"
                        (onClick)="openModalDespacho()">
                    </p-button>
                </div>
            </div>

            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-medium text-surface-700 dark:text-surface-300">Obra</label>
                        <p-select
                            [options]="obraOptions"
                            [(ngModel)]="idObra"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="-- Todas --"
                            (onChange)="onSelect($event.value)"
                            styleClass="w-full">
                        </p-select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-medium text-surface-700 dark:text-surface-300">Empresa</label>
                        <p-select
                            [options]="empresaOptions"
                            [(ngModel)]="idEmpresa"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="-- Todas --"
                            styleClass="w-full">
                        </p-select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-medium text-surface-700 dark:text-surface-300">Objeto</label>
                        <p-select
                            [options]="objetoOptions"
                            [(ngModel)]="idObj"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="-- Todos --"
                            styleClass="w-full">
                        </p-select>
                    </div>

                    <div class="flex items-end gap-2">
                        <p-button
                            label="Filtrar"
                            icon="pi pi-filter"
                            severity="info"
                            [outlined]="true"
                            (onClick)="filtrarDespachos()">
                        </p-button>
                        <p-button
                            label="Limpiar"
                            icon="pi pi-times"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="limpiarFiltros()">
                        </p-button>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-medium text-surface-700 dark:text-surface-300">Buscar por código</label>
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="codigoFiltro"
                        (input)="filtrarDespachos()"
                        placeholder="Ej: DSP-2025-00127"
                        class="w-full" />
                </div>
            </div>

            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
                <p-table
                    [value]="despachosFiltrados"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    styleClass="p-datatable-striped"
                    [paginator]="true"
                    [rows]="10"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} despachos">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Vale</th>
                            <th>Obra</th>
                            <th>Objeto</th>
                            <th>Empresa</th>
                            <th>Recursos</th>
                            <th>Fecha</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-item>
                        <tr>
                            <td class="font-medium">{{ item.codigo }}</td>
                            <td>{{ item.obra?.descripcion }}</td>
                            <td>{{ item.objeto?.descripcion }}</td>
                            <td>{{ item.empresa?.nombre }}</td>
                            <td>{{ item.despachos?.length }}</td>
                            <td>{{ item.fecha | date }}</td>
                            <td class="text-center">
                                <div class="flex justify-center gap-2">
                                    <p-button
                                        label="Ver Items"
                                        icon="pi pi-eye"
                                        severity="success"
                                        [outlined]="true"
                                        size="small"
                                        (onClick)="openModal(item)">
                                    </p-button>
                                    <p-button
                                        label="Cancelar"
                                        icon="pi pi-times"
                                        severity="danger"
                                        [outlined]="true"
                                        size="small"
                                        (onClick)="cancelVale(item)">
                                    </p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-8 text-surface-500">
                                No hay despachos registrados
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export default class DispatchesPageComponent {
    dispatcheSer = inject(DispatchesService);
    obraServ = inject(WorksService);
    objServ = inject(ObjectService);
    confServ = inject(ConfirmationService);
    reportService = inject(DispatchReportService);
    private dialogService = inject(DialogService);
    private ref: DynamicDialogRef | undefined;

    idObra: number = 0;
    idEmpresa: number = 0;
    idObj: number = 0;

    selectedObra!: WorksListItem;
    enterpriseList: EnterpriseListItem[] = [];
    despachosFiltrados: DispatcheListItem[] = [];
    originalDespachos: DispatcheListItem[] = [];
    codigoFiltro: string = '';

    get obraOptions() {
        return [
            { label: '-- Todas --', value: 0 },
            ...this.obraServ.list().map(o => ({ label: `${o.codigo} - ${o.descripcion}`, value: o.id }))
        ];
    }

    get empresaOptions() {
        return [
            { label: '-- Todas --', value: 0 },
            ...this.enterpriseList.map(e => ({ label: `${e.codigo} - ${e.nombre}`, value: e.id }))
        ];
    }

    get objetoOptions() {
        return [
            { label: '-- Todos --', value: 0 },
            ...this.objServ.list().map(o => ({ label: `${o.codigo} - ${o.descripcion}`, value: o.id }))
        ];
    }

    constructor() {
        effect(() => {
            const data = this.dispatcheSer.list();
            this.originalDespachos = [...data];
            this.despachosFiltrados = [...data];
        });
    }

    openModal(list: DespachoListItem) {
        this.ref = this.dialogService.open(ItemDispatchesModalComponent, {
            header: 'Recursos Despachados',
            width: '900px',
            modal: true,
            data: { items: list }
        });
    }

    openModalDespacho() {
        this.ref = this.dialogService.open(DispatchesModalComponent, {
            header: 'Crear Despacho',
            width: '900px',
            modal: true
        });

        this.ref.onClose.subscribe((result: boolean) => {
            if (result) {
                // Recargar los despachos después de crear uno nuevo
                this.dispatcheSer.loadDispatches();
            }
        });
    }

    onSelect(obraId: number) {
        this.idObra = obraId;
        if (!this.idObra || this.idObra === 0) return;
        const obra = this.obraServ.list().find((item) => item.id === this.idObra);
        if (!obra) return;

        this.selectedObra = obra;
        this.enterpriseList = obra.empresas;
        this.objServ.loadObjects(this.idObra);
    }

    filtrarDespachos() {
        this.despachosFiltrados = this.originalDespachos.filter((d) => {
            const coincideObra = this.idObra === 0 || d.obra?.id === this.idObra;
            const coincideEmpresa = this.idEmpresa === 0 || d.empresa?.id === this.idEmpresa;
            const coincideObjeto = this.idObj === 0 || d.objeto?.id === this.idObj;
            const coincideCodigo = d.codigo.toLowerCase().includes(this.codigoFiltro.toLowerCase());

            return coincideObra && coincideEmpresa && coincideObjeto && coincideCodigo;
        });
    }

    limpiarFiltros() {
        this.idObra = 0;
        this.idEmpresa = 0;
        this.idObj = 0;
        this.codigoFiltro = '';
        this.despachosFiltrados = [...this.originalDespachos];
    }

    cancelVale(item: DispatcheListItem) {
        this.confServ
            .confirm('Cancelar Vale', `¿Está seguro de cancelar el vale "${item.codigo}"?`)
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.dispatcheSer.cancelDispatches(item.id);
                }
            });
    }

    controlDespachos(): void {
        this.ref = this.dialogService.open(TimeReportModalComponent, {
            header: 'Intervalo del Reporte',
            width: '500px',
            modal: true
        });

        this.ref.onClose.subscribe((result: any) => {
            if (result) {
                if (result.selectAll) {
                    this.reportService.generateDispatchReport(this.despachosFiltrados);
                } else if (result.dateRange) {
                    const { startDate, endDate } = result.dateRange;
                    const arrayFilter = this.filterDespachosByDateRange(startDate, endDate);
                    if (arrayFilter.length === 0) {
                        alert('No existen despachos en el intervalo especificado, Revise sus datos!!!');
                    } else {
                        this.reportService.generateDispatchReport(arrayFilter);
                    }
                }
            }
        });
    }

    filterDespachosByDateRange(startDate: string, endDate: string): any[] {
        if (!startDate || !endDate) {
            return [...this.despachosFiltrados];
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.despachosFiltrados.filter((despacho) => {
            const fechaDespacho = new Date(despacho.fecha);
            return fechaDespacho >= start && fechaDespacho <= end;
        });
    }
}
