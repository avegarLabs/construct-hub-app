import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorksService } from '../../services/works.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faHelmetSafety,
  faAdd,
  faKaaba,
  faCubes,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { AddEmpesasModalComponent } from '../../components/add-empesas-modal/add-empesas-modal.component';
import { AddObjectModalComponent } from '../../components/add-object-modal/add-object-modal.component';
import { ObjectService } from '../../objects/services/object.service';
import { ResourceService } from '../../../resources/services/resource.service';
import { AddResourseComponent } from '../../components/add-resourse-modal/add-resourse-modal.component';
import { ResourceListItem } from '../../interfaces/resource-iterface';
import { ConfirmationService } from '../../../share/confirmation.service';
import { ObjetctListItem } from '../../interfaces/objects-iterface';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { DispatchReportService } from '../../../dispatches/services/dispatch-report.service';
import { DispatchesService } from '../../../dispatches/services/dispatches.service';

@Component({
  selector: 'app-works-details',
  imports: [FontAwesomeModule],
  templateUrl: './works-details.component.html',
})
export default class WorksDetailsComponent {
  private iconLibrary = inject(FaIconLibrary);
  private dialog = inject(MatDialog);
  actRoute = inject(ActivatedRoute);
  workService = inject(WorksService);
  objectServ = inject(ObjectService);
  resourceServ = inject(ResourceService);
  confServ = inject(ConfirmationService);
  printSer = inject(DispatchReportService);
  dispServ = inject(DispatchesService);

  constructor() {
    this.iconLibrary.addIcons(
      faHelmetSafety,
      faAdd,
      faKaaba,
      faCubes,
      faSearch
    );
  }

  private routeParams = toSignal(this.actRoute.params, {
    initialValue: { id: '' },
  });
  workId = computed(() => {
    const id = this.routeParams().id;
    return id ? Number(id) : null;
  });

  private loadWork = effect(() => {
    const id = this.workId();
    if (id) {
      this.workService.getWorks(id);
      this.objectServ.loadObjects(id);
      this.resourceServ.loadResources(id);
    }
  });

  getIconName(icon: string) {
    return icon.replace('fa', '').toLowerCase();
  }

  openModal() {
    const dialogRef = this.dialog.open(AddEmpesasModalComponent, {
      width: '700px',
      panelClass: 'tailwind-modal-panel',
    });

    dialogRef.afterClosed().subscribe((selectedIds: number[]) => {
      if (selectedIds) {
        const id = this.workId();
        this.workService.addEnterprises(id, selectedIds);
      }
    });
  }

  removeEmpresa(emp: EnterpriseListItem) {
    this.dispServ.loadDispatchesInEnterprise(emp.id).subscribe({
      next: (dispatches) => {
        if (dispatches.length > 0) {
          this.confServ
            .confirm(
              'Error',
              `No esta permitido borrar empresas con despachos asociados`
            )
            .subscribe((confirmed) => {});
          return;
        } else {
          this.confServ
            .confirm(
              'Eliminar Empresa',
              `¿Está seguro de eliminar la empresa "${emp.codigo}"?`
            )
            .subscribe((confirmed) => {
              if (confirmed) {
                const id = this.workId();
                this.workService.removeEnterprises(id, emp.id);
              }
            });
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  openModalObject() {
    const id = this.workId();
    const dialogRef = this.dialog.open(AddObjectModalComponent, {
      width: '700px',
      panelClass: 'tailwind-modal-panel',
      data: { workId: id },
    });

    dialogRef.afterClosed().subscribe((res: string) => {
      if (res) {
        const id = this.workId();
        this.objectServ.loadObjects(id);
      }
    });
  }

  removeObject(obj: ObjetctListItem) {
    this.dispServ.loadDispatchesInObjetos(obj.id).subscribe({
      next: (dispatches) => {
        if (dispatches.length > 0) {
          this.confServ
            .confirm(
              'Error',
              `No esta permitido borrar objetos con despachos asociados`
            )
            .subscribe((confirmed) => {});
          return;
        } else {
          this.confServ
            .confirm(
              'Eliminar Objeto',
              `¿Está seguro de eliminar el Objeto "${obj.codigo}"?`
            )
            .subscribe((confirmed) => {
              if (confirmed) {
                const id = this.workId();
                this.objectServ.removeObject(id, obj.id);
              }
            });
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  openModalResource(data: ResourceListItem) {
    const id = this.workId();
    const dialogRef = this.dialog.open(AddResourseComponent, {
      width: '700px',
      panelClass: 'tailwind-modal-panel',
      data: { workId: id, model: data },
    });

    dialogRef.afterClosed().subscribe((res: string) => {
      if (res) {
        const id = this.workId();
        this.resourceServ.loadResources(id);
      }
    });
  }

  removeResource(resource: ResourceListItem) {
    this.confServ
      .confirm(
        'Eliminar Recurso',
        `¿Está seguro de eliminar el recurso "${resource.codigo}"?`
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          const id = this.workId();
          this.resourceServ.removeResources(id, resource.id);
        }
      });
  }

  updateSearchTerm(term: string) {
    this.resourceServ.searchTerm.set(term);
  }

  printInv() {
    this.printSer.generateInventoryReport(
      this.workService.work(),
      this.resourceServ.filteredResources()
    );
  }

  handleError(error: any) {
    console.error('Error verificando despachos', error);
    // Opcional: Mostrar mensaje de error al usuario
  }
}
