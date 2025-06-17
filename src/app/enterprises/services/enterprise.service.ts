import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Enterprise,
  EnterpriseListItem,
} from '../interfaces/enterprise-interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnterpriseService {
  private http = inject(HttpClient);
  list = signal<EnterpriseListItem[]>([]);
  selectedEnterpriseId = signal<number | null>(null);

  constructor() {
    this.loadEnterprise();
  }

  currentEnterprise = computed(() => {
    return this.list().find((e) => e.id === this.selectedEnterpriseId());
  });

  setEnterpriseToEdit(id: number) {
    this.selectedEnterpriseId.set(id);
  }

  clearSelection() {
  this.selectedEnterpriseId.set(null);
}

  loadEnterprise() {
    this.http
      .get<EnterpriseListItem[]>(`${environment.api_route}/api/empresas`)
      .subscribe((data) => {
        this.list.set(data);
      });
  }

  newEnterprise(model: Enterprise) {
    this.http
      .post<EnterpriseListItem>(`${environment.api_route}/empresas`, model)
      .subscribe((data) => {
        this.loadEnterprise();
      });
  }

  editEnterprise(model: EnterpriseListItem) {
    const data: Enterprise = {
      nombre: model.nombre,
      codigo: model.codigo,
    };
    return this.http
      .put<EnterpriseListItem>(
        `${environment.api_route}/empresas/${model.id}`,
        data
      )
      .subscribe((data) => {
        this.loadEnterprise();
      });
  }

  removeEnterprise(id: number) {
    this.http
      .delete<boolean>(`${environment.api_route}/empresas/${id}`)
      .subscribe((data) => {
        this.loadEnterprise();
      });
  }

  prepareEdit(id: number) {
    this.selectedEnterpriseId.set(id);
  }

  cancelEdit() {
    this.selectedEnterpriseId.set(null);
    this.loadEnterprise();
  }
}
