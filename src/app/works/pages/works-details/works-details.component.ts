import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKaaba, faCubes, faHelmetSafety } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WorksService } from '../../services/works.service';
import { AddEmpesasModalComponent } from '../../components/add-empesas-modal/add-empesas-modal.component';
import { AddObjectModalComponent } from '../../components/add-object-modal/add-object-modal.component';
import { ObjectService } from '../../objects/services/object.service';
import { ResourceService } from '../../../resources/services/resource.service';
import { AddResourseComponent } from '../../components/add-resourse-modal/add-resourse-modal.component';
import { ImportResourcesModalComponent } from '../../components/import-resources-modal/import-resources-modal.component';
import { ResourceListItem } from '../../interfaces/resource-iterface';
import { ConfirmationService } from '../../../share/confirmation.service';
import { ObjetctListItem } from '../../interfaces/objects-iterface';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { DispatchReportService } from '../../../dispatches/services/dispatch-report.service';
import { DispatchesService } from '../../../dispatches/services/dispatches.service';

@Component({
    selector: 'app-works-details',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule, ButtonModule, TableModule, InputTextModule],
    providers: [DialogService],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Encabezado -->
            <div class="card">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div class="flex items-center gap-4">
                        <div class="bg-surface-100 dark:bg-surface-800 rounded-xl w-16 h-16 flex items-center justify-center">
                            <fa-icon [icon]="faKaaba" class="text-3xl text-surface-600"></fa-icon>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold">{{ workService.work().codigo }}</h1>
                            <p class="text-surface-600 dark:text-surface-400">{{ workService.work().descripcion }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección superior: 2 columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Columna 1: Empresas -->
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold">Empresas Constructoras</h2>
                        <p-button
                            label="Agregar"
                            icon="pi pi-plus"
                            severity="info"
                            [outlined]="true"
                            (onClick)="openModal()">
                        </p-button>
                    </div>

                    <div class="flex flex-col gap-4">
                        @for (emp of workService.work().empresas; track emp.id) {
                            <div class="flex items-center justify-between p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="bg-surface-100 dark:bg-surface-800 rounded-xl w-12 h-12 flex items-center justify-center">
                                        <fa-icon [icon]="faHelmetSafety" class="text-xl text-surface-600"></fa-icon>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold">{{ emp.codigo }}</h3>
                                        <p class="text-sm text-surface-600 dark:text-surface-400">{{ emp.nombre }}</p>
                                    </div>
                                </div>
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [outlined]="true"
                                    [rounded]="true"
                                    (onClick)="removeEmpresa(emp)">
                                </p-button>
                            </div>
                        }

                        @if (workService.work().empresas.length === 0) {
                            <div class="text-center py-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg">
                                <i class="pi pi-building text-4xl text-surface-400 mb-3"></i>
                                <p class="text-surface-500">No hay empresas asignadas a esta obra</p>
                                <p-button
                                    label="Agregar primera empresa"
                                    [link]="true"
                                    (onClick)="openModal()"
                                    class="mt-2">
                                </p-button>
                            </div>
                        }
                    </div>
                </div>

                <!-- Columna 2: Objetos -->
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold">
                            <i class="pi pi-box mr-2 text-purple-500"></i>Objetos de la Obra
                        </h2>
                        <p-button
                            label="Agregar"
                            icon="pi pi-plus"
                            severity="info"
                            [outlined]="true"
                            (onClick)="openModalObject()">
                        </p-button>
                    </div>

                    <div class="flex flex-col gap-4">
                        @for (obj of objectServ.list(); track obj.id) {
                            <div class="flex items-center justify-between p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="bg-surface-100 dark:bg-surface-800 rounded-xl w-12 h-12 flex items-center justify-center">
                                        <fa-icon [icon]="faCubes" class="text-xl text-surface-600"></fa-icon>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold">{{ obj.codigo }}</h3>
                                        <p class="text-sm text-surface-600 dark:text-surface-400">{{ obj.descripcion }}</p>
                                    </div>
                                </div>
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [outlined]="true"
                                    [rounded]="true"
                                    (onClick)="removeObject(obj)">
                                </p-button>
                            </div>
                        }

                        @if (objectServ.list().length === 0) {
                            <div class="text-center py-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg">
                                <fa-icon [icon]="faCubes" class="text-4xl text-surface-400 mb-3"></fa-icon>
                                <p class="text-surface-500">No hay objetos definidos para esta obra</p>
                                <p-button
                                    label="Crear primer objeto"
                                    [link]="true"
                                    (onClick)="openModalObject()"
                                    class="mt-2">
                                </p-button>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <!-- Sección inferior: Recursos -->
            <div class="card">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 class="text-xl font-bold">
                        <i class="pi pi-wrench mr-2 text-orange-500"></i>Recursos Asignados
                    </h2>
                    <div class="flex flex-wrap gap-2">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input
                                pInputText
                                type="text"
                                placeholder="Buscar recurso..."
                                (input)="updateSearchTerm($event)"
                                class="w-full md:w-auto" />
                        </span>
                        <p-button
                            label="Importar Excel"
                            icon="pi pi-file-excel"
                            severity="help"
                            [outlined]="true"
                            (onClick)="openImportModal()">
                        </p-button>
                        <p-button
                            label="Inventario PDF"
                            icon="pi pi-file-pdf"
                            severity="success"
                            [outlined]="true"
                            (onClick)="printInv()">
                        </p-button>
                        <p-button
                            label="Agregar"
                            icon="pi pi-plus"
                            severity="info"
                            (onClick)="openModalResource(null)">
                        </p-button>
                    </div>
                </div>

                <p-table
                    [value]="resourceServ.filteredResources()"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    styleClass="p-datatable-striped"
                    [paginator]="true"
                    [rows]="10"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} recursos">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Recurso</th>
                            <th>Descripción</th>
                            <th>UM</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Disponible</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-item>
                        <tr>
                            <td class="font-medium">{{ item.codigo }}</td>
                            <td>{{ item.descripcion }}</td>
                            <td>{{ item.um }}</td>
                            <td>{{ item.cantidad }}</td>
                            <td>{{ item.precio }}</td>
                            <td>{{ item.disponible }}</td>
                            <td class="text-center">
                                <div class="flex justify-center gap-2">
                                    <p-button
                                        icon="pi pi-pencil"
                                        severity="success"
                                        [outlined]="true"
                                        [rounded]="true"
                                        (onClick)="openModalResource(item)">
                                    </p-button>
                                    <p-button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        [outlined]="true"
                                        [rounded]="true"
                                        (onClick)="removeResource(item)">
                                    </p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-8">
                                <i class="pi pi-wrench text-4xl text-surface-400 mb-3"></i>
                                <p class="text-surface-500">No hay recursos asignados a esta obra</p>
                                <p-button
                                    label="Crear primer recurso"
                                    icon="pi pi-plus-circle"
                                    [link]="true"
                                    (onClick)="openModalResource(null)"
                                    class="mt-2">
                                </p-button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export default class WorksDetailsComponent {
    private dialogService = inject(DialogService);
    private ref: DynamicDialogRef | undefined;
    actRoute = inject(ActivatedRoute);
    workService = inject(WorksService);
    objectServ = inject(ObjectService);
    resourceServ = inject(ResourceService);
    confServ = inject(ConfirmationService);
    printSer = inject(DispatchReportService);
    dispServ = inject(DispatchesService);

    faKaaba = faKaaba;
    faCubes = faCubes;
    faHelmetSafety = faHelmetSafety;

    private routeParams = toSignal(this.actRoute.params, { initialValue: { id: '' } });

    workId = computed(() => {
        const id = this.routeParams().id;
        return id ? Number(id) : null;
    });

    private loadWork = effect(() => {
        const id = this.workId();
        if (id) {
            this.workService.getWorks(id);
            this.objectServ.loadObjects(id);
            this.resourceServ.loadResources(id);
        }
    });

    openModal() {
        this.ref = this.dialogService.open(AddEmpesasModalComponent, {
            header: 'Seleccionar Empresas',
            width: '700px',
            modal: true
        });

        this.ref.onClose.subscribe((selectedIds: number[]) => {
            if (selectedIds) {
                const id = this.workId();
                this.workService.addEnterprises(id, selectedIds);
            }
        });
    }

    removeEmpresa(emp: EnterpriseListItem) {
        this.dispServ.loadDispatchesInEnterprise(emp.id).subscribe({
            next: (dispatches) => {
                if (dispatches.length > 0) {
                    this.confServ
                        .confirm('Error', `No está permitido borrar empresas con despachos asociados`)
                        .subscribe(() => {});
                    return;
                } else {
                    this.confServ
                        .confirm('Eliminar Empresa', `¿Está seguro de eliminar la empresa "${emp.codigo}"?`)
                        .subscribe((confirmed) => {
                            if (confirmed) {
                                const id = this.workId();
                                this.workService.removeEnterprises(id, emp.id);
                            }
                        });
                }
            },
            error: (err) => this.handleError(err)
        });
    }

    openModalObject() {
        const id = this.workId();
        this.ref = this.dialogService.open(AddObjectModalComponent, {
            header: 'Agregar Objeto',
            width: '500px',
            modal: true,
            data: { workId: id }
        });

        this.ref.onClose.subscribe((res: string) => {
            if (res) {
                const id = this.workId();
                this.objectServ.loadObjects(id);
            }
        });
    }

    removeObject(obj: ObjetctListItem) {
        this.dispServ.loadDispatchesInObjetos(obj.id).subscribe({
            next: (dispatches) => {
                if (dispatches.length > 0) {
                    this.confServ
                        .confirm('Error', `No está permitido borrar objetos con despachos asociados`)
                        .subscribe(() => {});
                    return;
                } else {
                    this.confServ
                        .confirm('Eliminar Objeto', `¿Está seguro de eliminar el Objeto "${obj.codigo}"?`)
                        .subscribe((confirmed) => {
                            if (confirmed) {
                                const id = this.workId();
                                this.objectServ.removeObject(id, obj.id);
                            }
                        });
                }
            },
            error: (err) => this.handleError(err)
        });
    }

    openModalResource(data: ResourceListItem | null) {
        const id = this.workId();
        this.ref = this.dialogService.open(AddResourseComponent, {
            header: data ? 'Editar Recurso' : 'Agregar Recurso',
            width: '500px',
            modal: true,
            data: { workId: id, model: data }
        });

        this.ref.onClose.subscribe((res: string) => {
            if (res) {
                const id = this.workId();
                this.resourceServ.loadResources(id);
            }
        });
    }

    openImportModal() {
        const id = this.workId();
        this.ref = this.dialogService.open(ImportResourcesModalComponent, {
            header: 'Importar Recursos desde Excel',
            width: '700px',
            modal: true,
            data: { workId: id }
        });

        this.ref.onClose.subscribe((success: boolean) => {
            if (success) {
                const id = this.workId();
                this.resourceServ.loadResources(id!);
            }
        });
    }

    removeResource(resource: ResourceListItem) {
        this.confServ
            .confirm('Eliminar Recurso', `¿Está seguro de eliminar el recurso "${resource.codigo}"?`)
            .subscribe((confirmed) => {
                if (confirmed) {
                    const id = this.workId();
                    this.resourceServ.removeResources(id, resource.id);
                }
            });
    }

    updateSearchTerm(event: Event) {
        const target = event.target as HTMLInputElement;
        this.resourceServ.searchTerm.set(target.value);
    }

    printInv() {
        this.printSer.generateInventoryReport(this.workService.work(), this.resourceServ.filteredResources());
    }

    handleError(error: any) {
        console.error('Error verificando despachos', error);
    }
}
