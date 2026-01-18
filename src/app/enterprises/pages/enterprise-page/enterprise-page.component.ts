import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterpriseService } from '../../services/enterprise.service';
import ListComponent from '../../components/list/list.component';
import FormComponent from '../../components/form/form.component';
import { Enterprise, EnterpriseListItem } from '../../interfaces/enterprise-interface';

@Component({
    selector: 'app-enterprise-page',
    standalone: true,
    imports: [CommonModule, ListComponent, FormComponent],
    template: `
        <div class="card">
            <h2 class="text-2xl font-bold mb-6">Gestion de Empresas</h2>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-4">
                    <enterprise-form
                        [enterpriseToEdit]="enterpriseService.currentEnterprise()"
                        (enterpriseAction)="handleEnterpriseAction($event)" />
                </div>

                <div class="lg:col-span-8">
                    <enterprise-list
                        [enterprises]="enterpriseService.list()"
                        (deleteEnterprise)="enterpriseService.removeEnterprise($event)"
                        (editEnterprise)="enterpriseService.setEnterpriseToEdit($event)" />
                </div>
            </div>
        </div>
    `
})
export default class EnterprisePageComponent {
    enterpriseService = inject(EnterpriseService);

    handleEnterpriseAction(event: { type: 'create' | 'update'; data: EnterpriseListItem }): void {
        if (event.type === 'create') {
            const data: Enterprise = {
                codigo: event.data.codigo,
                nombre: event.data.nombre
            };
            this.enterpriseService.newEnterprise(data);
        } else {
            this.enterpriseService.editEnterprise(event.data);
            this.enterpriseService.clearSelection();
        }
    }
}
