import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Resource,
  ResourceListItem,
} from '../../works/interfaces/resource-iterface';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  list = signal<ResourceListItem[]>([]);
  searchTerm = signal<string>('');

  loadResources(workId: number) {
    this.http
      .get<ResourceListItem[]>(
        `${environment.api_route}/api/recursos/obra/${workId}`
      )
      .subscribe((data) => {
        this.list.set(data);
        console.log({ data });
      });
  }

  newResource(model: Resource) {
    this.http
      .post<ResourceListItem>(`${environment.api_route}/api/recursos`, model)
      .subscribe((data) => {
        console.log(data);
        this.loadResources(model.obraId);
      });
  }

  updateResource(recId: number, model: Resource) {
    this.http
      .put<ResourceListItem>(
        `${environment.api_route}/api/recursos/${recId}`,
        model
      )
      .subscribe((data) => {
        console.log(data);
        this.loadResources(model.obraId);
      });
  }

  removeResources(workId: number, id: number) {
    this.http
      .delete<boolean>(`${environment.api_route}/api/recursos/${id}`)
      .subscribe((data) => {
        this.loadResources(workId);
      });
  }

  filteredResources = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.list();
    }
    return this.list().filter(
      (resource) =>
        resource.codigo.toLowerCase().includes(term) ||
        resource.descripcion.toLowerCase().includes(term)
    );
  });
}
