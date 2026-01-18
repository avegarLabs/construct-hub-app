import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  DispatcheListItem,
  Dispatches,
} from '../interfaces/dispatches-iterface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DispatchesService {
  private http = inject(HttpClient);
  list = signal<DispatcheListItem[]>([]);
  tempList = signal<DispatcheListItem[]>([]);
  selectedEnterpriseId = signal<number | null>(null);

  constructor() {
    this.loadDispatches();
  }

  loadDispatches() {
    this.http
      .get<DispatcheListItem[]>(`${environment.api_route}/vales`)
      .subscribe((data) => {
        console.log(data);
        // Ordenar por fecha descendente (más reciente primero)
        const sortedData = data.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.list.set(sortedData);
      });
  }

  /**
   * Genera el siguiente código de despacho disponible desde el backend
   * Garantiza unicidad y previene race conditions
   */
  generateNextCode(): Observable<{ codigo: string }> {
    return this.http.get<{ codigo: string }>(
      `${environment.api_route}/vales/next-code`
    );
  }

  newDispatches(model: Dispatches): Observable<DispatcheListItem[]> {
    return this.http
      .post<DispatcheListItem[]>(`${environment.api_route}/vales`, model)
      .pipe(
        tap(() => {
          // Recargar la lista de despachos después de crear uno nuevo
          this.loadDispatches();
        })
      );
  }

  cancelDispatches(valeId: number) {
    this.http
      .delete<Boolean>(`${environment.api_route}/vales/${valeId}`)
      .subscribe(() => {
        this.loadDispatches();
      });
  }

  loadDispatchesInObjetos(objId: number) {
    return this.http
      .get<DispatcheListItem[]>(
        `${environment.api_route}/vales/byObjeto/${objId}`
      )
      .pipe(
        tap((data) => {
          // Ordenar por fecha descendente (más reciente primero)
          const sortedData = data.sort((a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          this.tempList.set(sortedData);
        })
      );
  }

  loadDispatchesInEnterprise(entId: number) {
    return this.http
      .get<DispatcheListItem[]>(
        `${environment.api_route}/vales/byEmpresa/${entId}`
      )
      .pipe(
        tap((data) => {
          // Ordenar por fecha descendente (más reciente primero)
          const sortedData = data.sort((a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          this.tempList.set(sortedData);
        })
      );
  }
}
