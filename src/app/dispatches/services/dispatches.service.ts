import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  selectedEnterpriseId = signal<number | null>(null);

  constructor() {
    this.loadDispatches();
  }

  loadDispatches() {
    this.http
      .get<DispatcheListItem[]>(`${environment.api_route}/vales`)
      .subscribe((data) => {
        console.log(data)
        this.list.set(data);
      });
  }

  newDispatches(model: Dispatches) {
    this.http
      .post<DispatcheListItem[]>(`${environment.api_route}/vales`, model)
      .subscribe((data) => {
        this.loadDispatches();
      });
  }

   cancelDispatches(valeId:number) {
    this.http
      .delete<Boolean>(`${environment.api_route}/vales/${valeId}`)
      .subscribe((data) => {
        this.loadDispatches();
      });
  }
  

}
