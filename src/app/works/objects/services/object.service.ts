import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Object, ObjetctListItem } from '../../interfaces/objects-iterface';

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  private http = inject(HttpClient);
  list = signal<ObjetctListItem[]>([]);

  loadObjects(workId: number) {
    this.http
      .get<ObjetctListItem[]>(
        `${environment.api_route}/api/objetos/obra/${workId}`
      )
      .subscribe((data) => {
        this.list.set(data);
        console.log({ data });
      });
  }

  newObject(model: Object) {
    this.http
      .post<ObjetctListItem>(`${environment.api_route}/api/objetos`, model)
      .subscribe((data) => {
        console.log(data)
        this.loadObjects(model.obraId);
      });
  }

  removeObject(workId: number, id: number) {
    this.http
      .delete<boolean>(`${environment.api_route}/api/objetos/${id}`)
      .subscribe((data) => {
        this.loadObjects(workId);
      });
  }
}
