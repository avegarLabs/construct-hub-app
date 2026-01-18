import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ObjectService } from '../../objects/services/object.service';
import { Object } from '../../interfaces/objects-iterface';

@Component({
    selector: 'app-add-object-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
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
                    <small class="text-red-500">La descripción del objeto es requerida</small>
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
                    type="submit"
                    label="Agregar"
                    [disabled]="form.invalid">
                </p-button>
            </div>
        </form>
    `
})
export class AddObjectModalComponent {
    private dialogRef = inject(DynamicDialogRef);
    private config = inject(DynamicDialogConfig);
    private objectService = inject(ObjectService);

    form = new FormGroup({
        codigo: new FormControl('', [Validators.required]),
        descripcion: new FormControl('', [Validators.required])
    });

    confirm() {
        if (this.form.invalid) return;

        const model: Object = {
            codigo: this.form.value.codigo!,
            descripcion: this.form.value.descripcion!,
            obraId: this.config.data.workId
        };

        this.objectService.newObject(model);
        this.form.reset();
        this.dialogRef.close(true);
    }

    cancel() {
        this.dialogRef.close();
    }
}
