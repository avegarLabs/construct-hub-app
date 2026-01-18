import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WorksService } from '../../../works/services/works.service';
import { ObjectService } from '../../../works/objects/services/object.service';
import { DispatchesService } from '../../services/dispatches.service';
import { ResourceService } from '../../../resources/services/resource.service';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { ResourceListItem } from '../../../works/interfaces/resource-iterface';
import { Dispatches, ResourceCuant } from '../../interfaces/dispatches-iterface';

interface ResourceDispatch {
    resource: ResourceListItem;
    cantidad: number;
}

@Component({
    selector: 'app-dispatches-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DropdownModule,
        InputTextModule,
        InputNumberModule,
        TableModule,
        AutoCompleteModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right"></p-toast>

        <div class="flex flex-col gap-4">
            <!-- Código de Despacho -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="flex items-center gap-3">
                    <i class="pi pi-barcode text-2xl text-blue-600"></i>
                    <div>
                        <p class="text-sm text-surface-600 dark:text-surface-400">Código de Despacho</p>
                        <p class="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
                            {{ code() }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Obra -->
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-surface-700 dark:text-surface-300">
                    <i class="pi pi-building text-blue-500 mr-2"></i>Obra *
                </label>
                <p-dropdown
                    [options]="obraOptions()"
                    [ngModel]="idObra()"
                    (ngModelChange)="onSelectObra($event)"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccione una obra"
                    [showClear]="true"
                    styleClass="w-full">
                </p-dropdown>
            </div>

            @if (idObra() && idObra() > 0) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Empresa -->
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-surface-700 dark:text-surface-300">
                            <i class="pi pi-users text-green-500 mr-2"></i>Empresa *
                        </label>
                        <p-dropdown
                            [options]="empresaOptions()"
                            [ngModel]="idEmpresa()"
                            (ngModelChange)="idEmpresa.set($event)"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccione una empresa"
                            [showClear]="true"
                            styleClass="w-full">
                        </p-dropdown>
                    </div>

                    <!-- Objeto -->
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-surface-700 dark:text-surface-300">
                            <i class="pi pi-box text-purple-500 mr-2"></i>Objeto *
                        </label>
                        <p-dropdown
                            [options]="objetoOptions()"
                            [ngModel]="idObj()"
                            (ngModelChange)="idObj.set($event)"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccione un objeto"
                            [showClear]="true"
                            styleClass="w-full">
                        </p-dropdown>
                    </div>
                </div>

                <!-- Agregar Recursos -->
                <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
                    <h3 class="text-base font-semibold mb-3 text-surface-700 dark:text-surface-300">
                        <i class="pi pi-box text-orange-500 mr-2"></i>Agregar Recursos
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <!-- AutoComplete Recurso -->
                        <div class="md:col-span-6 flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-600 dark:text-surface-400">Recurso</label>
                            <p-autocomplete
                                [(ngModel)]="selectedRecurso"
                                [suggestions]="filteredResources()"
                                (completeMethod)="filterResources($event)"
                                optionLabel="descripcion"
                                [dropdown]="true"
                                [forceSelection]="true"
                                placeholder="Buscar recurso..."
                                styleClass="w-full">
                                <ng-template let-resource pTemplate="item">
                                    <div class="flex flex-col py-2">
                                        <div class="font-medium">{{ resource.codigo }}</div>
                                        <div class="text-sm text-surface-500">{{ resource.descripcion }}</div>
                                        <div class="text-xs text-blue-600">
                                            Disponible: {{ resource.disponible }} {{ resource.um }}
                                        </div>
                                    </div>
                                </ng-template>
                            </p-autocomplete>
                        </div>

                        <!-- Cantidad -->
                        <div class="md:col-span-4 flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-600 dark:text-surface-400">Cantidad</label>
                            <p-inputNumber
                                [(ngModel)]="cantidad"
                                [min]="0.01"
                                [max]="maxCantidad()"
                                [showButtons]="true"
                                [disabled]="!selectedRecurso()"
                                [minFractionDigits]="2"
                                [maxFractionDigits]="2"
                                styleClass="w-full">
                            </p-inputNumber>
                            @if (selectedRecurso()) {
                                <small class="text-surface-500">Máximo: {{ maxCantidad() }}</small>
                            }
                        </div>

                        <!-- Botón Agregar -->
                        <div class="md:col-span-2 flex items-end">
                            <p-button
                                label="Agregar"
                                icon="pi pi-plus"
                                severity="success"
                                [disabled]="!canAddResource()"
                                (onClick)="addResource()"
                                styleClass="w-full">
                            </p-button>
                        </div>
                    </div>
                </div>

                <!-- Tabla de recursos agregados -->
                @if (resourceList().length > 0) {
                    <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                        <p-table [value]="resourceList()" [tableStyle]="{ 'min-width': '100%' }">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>U/M</th>
                                    <th class="text-right">Cantidad</th>
                                    <th class="text-center" style="width: 100px">Acciones</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-item>
                                <tr>
                                    <td class="font-medium">{{ item.resource.codigo }}</td>
                                    <td>{{ item.resource.descripcion }}</td>
                                    <td>{{ item.resource.um }}</td>
                                    <td class="text-right">{{ item.cantidad | number:'1.2-2' }}</td>
                                    <td class="text-center">
                                        <p-button
                                            icon="pi pi-trash"
                                            severity="danger"
                                            [text]="true"
                                            [rounded]="true"
                                            (onClick)="removeResource(item.resource.id)">
                                        </p-button>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                } @else {
                    <div class="text-center py-6 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg">
                        <i class="pi pi-box text-4xl text-surface-400 mb-2"></i>
                        <p class="text-surface-500">No hay recursos agregados al despacho</p>
                    </div>
                }
            }

            <!-- Botones de acción -->
            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancel()">
                </p-button>
                <p-button
                    label="Guardar Despacho"
                    icon="pi pi-save"
                    [disabled]="!canSave()"
                    [loading]="isSaving()"
                    (onClick)="saveDispatch()">
                </p-button>
            </div>
        </div>
    `
})
export class DispatchesModalComponent implements OnInit {
    private dialogRef = inject(DynamicDialogRef);
    private obraServ = inject(WorksService);
    private objServ = inject(ObjectService);
    private dispServ = inject(DispatchesService);
    private resourcesServ = inject(ResourceService);
    private messageService = inject(MessageService);

    // State signals
    code = signal<string>('Se generará automáticamente');
    isSaving = signal<boolean>(false);
    selectedRecurso = signal<ResourceListItem | null>(null);
    filteredResources = signal<ResourceListItem[]>([]);
    resourceList = signal<ResourceDispatch[]>([]);
    enterpriseList = signal<EnterpriseListItem[]>([]);

    // Form state (convertido a signals para reactividad)
    idObra = signal<number>(0);
    idEmpresa = signal<number>(0);
    idObj = signal<number>(0);
    cantidad: number = 1;

    // Computed values
    obraOptions = computed(() =>
        this.obraServ.list().map(o => ({
            label: `${o.codigo} - ${o.descripcion}`,
            value: o.id
        }))
    );

    empresaOptions = computed(() =>
        this.enterpriseList().map(e => ({
            label: `${e.codigo} - ${e.nombre}`,
            value: e.id
        }))
    );

    objetoOptions = computed(() =>
        this.objServ.list().map(o => ({
            label: `${o.codigo} - ${o.descripcion}`,
            value: o.id
        }))
    );

    resourceOptions = computed(() => {
        const resources = this.resourcesServ.list();
        console.log('Recursos disponibles:', resources.length);
        return resources.filter(r => r.disponible > 0);
    });

    maxCantidad = computed(() => {
        const recurso = this.selectedRecurso();
        return recurso ? recurso.disponible : 0;
    });

    canAddResource = computed(() => {
        const recurso = this.selectedRecurso();
        return recurso !== null &&
               this.cantidad > 0 &&
               this.cantidad <= this.maxCantidad();
    });

    canSave = computed(() => {
        const isValid = this.idObra() > 0 &&
                       this.idEmpresa() > 0 &&
                       this.idObj() > 0 &&
                       this.resourceList().length > 0 &&
                       !this.isSaving();

        console.log('canSave evaluado:', {
            idObra: this.idObra(),
            idEmpresa: this.idEmpresa(),
            idObj: this.idObj(),
            resourcesCount: this.resourceList().length,
            isSaving: this.isSaving(),
            result: isValid
        });

        return isValid;
    });

    ngOnInit(): void {
        // Cargar las obras
        console.log('Inicializando modal de despachos');
        console.log('Obras disponibles:', this.obraServ.list().length);

        // Generar el código del despacho
        this.loadNextCode();
    }

    private loadNextCode(): void {
        this.dispServ.generateNextCode().subscribe({
            next: (response) => {
                this.code.set(response.codigo);
                console.log('Código generado para el despacho:', response.codigo);
            },
            error: (error) => {
                console.error('Error al generar código:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo generar el código del despacho'
                });
            }
        });
    }

    onSelectObra(obraId: number | null): void {
        console.log('Obra seleccionada:', obraId);

        if (!obraId || obraId === 0) {
            this.resetObraRelatedData();
            return;
        }

        this.idObra.set(obraId);
        const obra = this.obraServ.list().find(item => item.id === obraId);

        if (!obra) {
            console.error('No se encontró la obra');
            return;
        }

        console.log('Cargando datos de obra:', obra.codigo);

        // Cargar empresas de la obra
        this.enterpriseList.set(obra.empresas || []);
        console.log('Empresas cargadas:', this.enterpriseList().length);

        // Cargar objetos
        this.objServ.loadObjects(obraId);
        console.log('Cargando objetos...');

        // Cargar recursos
        this.resourcesServ.loadResources(obraId);
        console.log('Cargando recursos...');

        // Reset selecciones dependientes
        this.idEmpresa.set(0);
        this.idObj.set(0);
        this.selectedRecurso.set(null);
        this.resourceList.set([]);
    }

    filterResources(event: AutoCompleteCompleteEvent): void {
        const query = (event.query || '').toLowerCase();
        const allOptions = this.resourceOptions();

        console.log('Filtrando recursos, total:', allOptions.length, 'query:', query);

        if (!query) {
            this.filteredResources.set(allOptions);
        } else {
            const filtered = allOptions.filter(resource =>
                resource.codigo.toLowerCase().includes(query) ||
                resource.descripcion.toLowerCase().includes(query)
            );
            this.filteredResources.set(filtered);
        }

        console.log('Recursos filtrados:', this.filteredResources().length);
    }

    addResource(): void {
        if (!this.canAddResource()) {
            console.log('No se puede agregar recurso');
            return;
        }

        const resource = this.selectedRecurso()!;

        // Verificar si el recurso ya está en la lista
        const exists = this.resourceList().some(item => item.resource.id === resource.id);
        if (exists) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Recurso duplicado',
                detail: 'Este recurso ya está agregado al despacho'
            });
            return;
        }

        // Agregar recurso a la lista
        this.resourceList.update(list => [
            ...list,
            { resource, cantidad: this.cantidad }
        ]);

        console.log('Recurso agregado:', resource.codigo, 'Total:', this.resourceList().length);

        // Reset form
        this.selectedRecurso.set(null);
        this.cantidad = 1;

        this.messageService.add({
            severity: 'success',
            summary: 'Recurso agregado',
            detail: `${resource.codigo} agregado correctamente`
        });
    }

    removeResource(id: number): void {
        this.resourceList.update(list =>
            list.filter(item => item.resource.id !== id)
        );

        this.messageService.add({
            severity: 'info',
            summary: 'Recurso eliminado',
            detail: 'El recurso fue removido del despacho'
        });
    }

    saveDispatch(): void {
        if (!this.canSave()) {
            console.log('No se puede guardar');
            return;
        }

        this.isSaving.set(true);

        const codigo = this.code();
        console.log('Guardando despacho con código:', codigo);

        // Preparar el despacho
        const despachos: ResourceCuant[] = this.resourceList().map(item => ({
            recursoId: item.resource.id,
            cantidadDespachada: item.cantidad
        }));

        const dispatch: Dispatches = {
            codigo,
            obraId: this.idObra(),
            objetoId: this.idObj(),
            empresaId: this.idEmpresa(),
            despachos
        };

        console.log('Datos del despacho:', dispatch);

        // Guardar el despacho
        this.dispServ.newDispatches(dispatch).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Despacho creado',
                    detail: `Despacho ${codigo} creado exitosamente`
                });

                setTimeout(() => {
                    this.isSaving.set(false);
                    this.dialogRef.close(true);
                }, 1500);
            },
            error: (error) => {
                console.error('Error al crear despacho:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.error?.message || 'No se pudo crear el despacho'
                });
                this.isSaving.set(false);
            }
        });
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

    private resetObraRelatedData(): void {
        this.enterpriseList.set([]);
        this.idObra.set(0);
        this.idEmpresa.set(0);
        this.idObj.set(0);
        this.selectedRecurso.set(null);
        this.resourceList.set([]);
    }
}
