import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { WorksService } from '../../services/works.service';
import { Works } from '../../interfaces/works-interface';

@Component({
    selector: 'app-add-work',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, FloatLabelModule],
    template: `
        <form [formGroup]="form" (ngSubmit)="confirm()" class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label for="codigo" class="font-medium">Codigo</label>
                <input
                    pInputText
                    id="codigo"
                    formControlName="codigo"
                    class="w-full"
                    [class.ng-invalid]="form.controls.codigo.invalid && form.controls.codigo.touched"
                />
                <small class="text-red-500" *ngIf="form.controls.codigo.invalid && form.controls.codigo.touched">
                    El codigo es requerido
                </small>
            </div>

            <div class="flex flex-col gap-2">
                <label for="descripcion" class="font-medium">Descripcion</label>
                <input
                    pInputText
                    id="descripcion"
                    formControlName="descripcion"
                    class="w-full"
                    [class.ng-invalid]="form.controls.descripcion.invalid && form.controls.descripcion.touched"
                />
                <small class="text-red-500" *ngIf="form.controls.descripcion.invalid && form.controls.descripcion.touched">
                    La descripcion es requerida
                </small>
            </div>

            <div class="flex justify-end gap-2 pt-4">
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
export class AddWorkComponent implements OnInit {
    private workService = inject(WorksService);
    private dialogRef = inject(DynamicDialogRef);
    private config = inject(DynamicDialogConfig);

    form = new FormGroup({
        codigo: new FormControl('', [Validators.required]),
        descripcion: new FormControl('', [Validators.required])
    });

    get isEditMode(): boolean {
        return this.config.data?.model !== null;
    }

    ngOnInit(): void {
        if (this.config.data?.model) {
            this.form.patchValue({
                codigo: this.config.data.model.codigo,
                descripcion: this.config.data.model.descripcion
            });
        }
    }

    confirm(): void {
        if (this.form.invalid) return;

        const model: Works = {
            codigo: this.form.value.codigo!,
            descripcion: this.form.value.descripcion!,
            empresasId: []
        };

        if (!this.config.data?.model) {
            this.workService.newWorks(model);
        } else {
            this.workService.editWorks(this.config.data.model.id, model);
        }

        this.form.reset();
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }
}
