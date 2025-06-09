import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Works, WorksListItem } from '../interfaces/works-interface';

@Injectable({
  providedIn: 'root',
})
export class WorksService {
  private http = inject(HttpClient);
  list = signal<WorksListItem[]>([]);
  work = signal<WorksListItem>(null);
  selectedWorksId = signal<number | null>(null);

  constructor() {
    this.loadWorks();
  }

  loadWorks() {
    this.http
      .get<WorksListItem[]>(`${environment.api_route}/api/obras`)
      .subscribe((data) => {
        this.list.set(data);
        console.log({ data });
      });
  }

  newWorks(model: Works) {
    this.http
      .post<Works>(`${environment.api_route}/api/obras`, model)
      .subscribe((data) => {
        this.loadWorks();
      });
  }

  editWorks(id: number, model: Works) {
    return this.http
      .put<WorksListItem>(`${environment.api_route}/api/obras/${id}`, model)
      .subscribe((data) => {
        this.loadWorks();
      });
  }

  removeWorks(id: number) {
    this.http
      .delete<boolean>(`${environment.api_route}/api/obras/${id}`)
      .subscribe((data) => {
        this.loadWorks();
      });
  }

  getWorks(id: number) {
    this.http
      .get<WorksListItem>(`${environment.api_route}/api/obras/${id}`)
      .subscribe((data) => {
        this.work.set(data);
      });
  }

  addEnterprises(workId: number, ids: number[]) {
    return this.http
      .put<WorksListItem>(
        `${environment.api_route}/api/obras/add/${workId}`,
        ids
      )
      .subscribe((data) => {
        this.getWorks(workId);
      });
  }

  removeEnterprises(workId: number, entId:number) {
    return this.http
      .get<WorksListItem>(
        `${environment.api_route}/api/obras/removeIn/${workId}/emp/${entId}`,
      )
      .subscribe((data) => {
        this.getWorks(workId);
      });
  }
}
