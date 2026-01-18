import { Component, inject, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EnterpriseListItem } from '../../interfaces/enterprise-interface';
import { EnterpriseService } from '../../services/enterprise.service';

@Component({
    selector: 'enterprise-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h3 class="text-xl font-bold mb-6">
                {{ enterpriseService.currentEnterprise() ? 'Editar Empresa' : 'Nueva Empresa' }}
            </h3>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="code" class="font-medium">Codigo REUP</label>
                    <input
                        pInputText
                        id="code"
                        formControlName="code"
                        class="w-full"
                        [class.ng-invalid]="form.controls.code.invalid && form.controls.code.touched"
                    />
                    <small class="text-red-500" *ngIf="form.controls.code.invalid && form.controls.code.touched">
                        El codigo REUP es requerido
                    </small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="name" class="font-medium">Nombre</label>
                    <input
                        pInputText
                        id="name"
                        formControlName="name"
                        class="w-full"
                        [class.ng-invalid]="form.controls.name.invalid && form.controls.name.touched"
                    />
                    <small class="text-red-500" *ngIf="form.controls.name.invalid && form.controls.name.touched">
                        El nombre es requerido
                    </small>
                </div>

                <p-button
                    type="submit"
                    label="Guardar"
                    icon="pi pi-save"
                    [disabled]="form.invalid"
                    styleClass="w-full mt-4">
                </p-button>
            </form>
        </div>
    `
})
export default class FormComponent {
    enterpriseAction = output<{ type: 'create' | 'update'; data: EnterpriseListItem }>();
    enterpriseService = inject(EnterpriseService);

    form = new FormGroup({
        code: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required])
    });

    @Input() set enterpriseToEdit(enterprise: EnterpriseListItem | null | undefined) {
        if (enterprise) {
            this.form.patchValue({
                code: enterprise.codigo,
                name: enterprise.nombre
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const enterpriseData: EnterpriseListItem = {
            id: this.enterpriseService.selectedEnterpriseId()!,
            codigo: this.form.value.code!,
            nombre: this.form.value.name!
        };

        const actionType = this.enterpriseService.selectedEnterpriseId() ? 'update' : 'create';
        this.enterpriseAction.emit({ type: actionType, data: enterpriseData });
        this.form.reset();
    }
}
