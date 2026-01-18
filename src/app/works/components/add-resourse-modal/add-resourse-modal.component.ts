import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ResourceService } from '../../../resources/services/resource.service';
import { Resource } from '../../interfaces/resource-iterface';

@Component({
    selector: 'app-add-resourse',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule],
    template: `
        <form [formGroup]="form" (ngSubmit)="confirm()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label for="codigo" class="font-medium">Código</label>
                <input
                    pInputText
                    id="codigo"
                    formControlName="codigo"
                    class="w-full"
                    [class.ng-invalid]="form.controls.codigo.invalid && form.controls.codigo.touched" />
                @if (form.controls.codigo.invalid && form.controls.codigo.touched) {
                    <small class="text-red-500">El código es requerido</small>
                }
            </div>

            <div class="flex flex-col gap-2">
                <label for="descripcion" class="font-medium">Descripción</label>
                <input
                    pInputText
                    id="descripcion"
                    formControlName="descripcion"
                    class="w-full"
                    [class.ng-invalid]="form.controls.descripcion.invalid && form.controls.descripcion.touched" />
                @if (form.controls.descripcion.invalid && form.controls.descripcion.touched) {
                    <small class="text-red-500">La descripción es requerida</small>
                }
            </div>

            <div class="flex flex-col gap-2">
                <label for="um" class="font-medium">U/M</label>
                <input
                    pInputText
                    id="um"
                    formControlName="um"
                    class="w-full"
                    [class.ng-invalid]="form.controls.um.invalid && form.controls.um.touched" />
                @if (form.controls.um.invalid && form.controls.um.touched) {
                    <small class="text-red-500">La U/M es requerida</small>
                }
            </div>

            <div class="flex flex-col gap-2">
                <label for="cantidad" class="font-medium">Cantidad</label>
                <p-inputNumber
                    inputId="cantidad"
                    formControlName="cantidad"
                    [minFractionDigits]="0"
                    styleClass="w-full">
                </p-inputNumber>
                @if (form.controls.cantidad.invalid && form.controls.cantidad.touched) {
                    <small class="text-red-500">La cantidad es requerida</small>
                }
            </div>

            <div class="flex flex-col gap-2">
                <label for="precio" class="font-medium">Precio</label>
                <p-inputNumber
                    inputId="precio"
                    formControlName="precio"
                    [minFractionDigits]="2"
                    mode="decimal"
                    styleClass="w-full">
                </p-inputNumber>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancel()">
                </p-button>
                <p-button
                    type="submit"
                    [label]="isEditMode ? 'Guardar' : 'Agregar'"
                    [disabled]="form.invalid">
                </p-button>
            </div>
        </form>
    `
})
export class AddResourseComponent implements OnInit {
    private dialogRef = inject(DynamicDialogRef);
    private config = inject(DynamicDialogConfig);
    private resourceServ = inject(ResourceService);

    form = new FormGroup({
        codigo: new FormControl('', [Validators.required]),
        descripcion: new FormControl('', [Validators.required]),
        um: new FormControl('', [Validators.required]),
        cantidad: new FormControl<number | null>(null, [Validators.required]),
        precio: new FormControl<number | null>(0)
    });

    get isEditMode(): boolean {
        return this.config.data?.model !== null;
    }

    ngOnInit(): void {
        if (this.config.data?.model) {
            this.form.patchValue({
                codigo: this.config.data.model.codigo,
                descripcion: this.config.data.model.descripcion,
                um: this.config.data.model.um,
                cantidad: this.config.data.model.cantidad,
                precio: this.config.data.model.precio
            });
        }
    }

    confirm() {
        if (this.form.invalid) return;

        const model: Resource = {
            codigo: this.form.value.codigo!,
            descripcion: this.form.value.descripcion!,
            obraId: this.config.data.workId,
            um: this.form.value.um!,
            cantidad: Number(this.form.value.cantidad),
            precio: Number(this.form.value.precio)
        };

        if (!this.config.data?.model) {
            this.resourceServ.newResource(model);
            this.form.reset();
        } else {
            this.resourceServ.updateResource(this.config.data.model.id, model);
            this.form.reset();
            this.dialogRef.close(true);
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
