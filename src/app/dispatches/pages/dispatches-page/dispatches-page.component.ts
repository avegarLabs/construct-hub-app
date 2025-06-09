import { Component, effect, inject } from '@angular/core';
import { DispatchesService } from '../../services/dispatches.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ItemDispatchesModalComponent } from '../../components/item-dispatches-modal/item-dispatches-modal.component';
import {
  DespachoListItem,
  DispatcheListItem,
} from '../../interfaces/dispatches-iterface';
import { DispatchesModalComponent } from '../../components/dispatches-modal/dispatches-modal.component';
import { WorksService } from '../../../works/services/works.service';
import { ObjectService } from '../../../works/objects/services/object.service';
import { WorksListItem } from '../../../works/interfaces/works-interface';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '../../../share/confirmation.service';
import { DispatchReportService } from '../../services/dispatch-report.service';

@Component({
  selector: 'app-dispatches-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './dispatches-page.component.html',
})
export default class DispatchesPageComponent {
  dispatcheSer = inject(DispatchesService);
  obraServ = inject(WorksService);
  objServ = inject(ObjectService);
  confServ = inject(ConfirmationService);
  reportService = inject(DispatchReportService);
  private dialog = inject(MatDialog);

  idObra: number = 0;
  idEmpresa: number = 0;
  idObj: number = 0;

  selectedObra!: WorksListItem;
  enterpriseList: EnterpriseListItem[] = [];
  despachosFiltrados: DispatcheListItem[];
  originalDespachos: DispatcheListItem[];
  codigoFiltro: string = '';

  constructor() {
    effect(() => {
      const data = this.dispatcheSer.list();
      this.originalDespachos = [...data];
      this.despachosFiltrados = [...data];
    });
  }

  openModal(list: DespachoListItem) {
    console.log(list)
    const dialogRef = this.dialog.open(ItemDispatchesModalComponent, {
      width: '900px',
      panelClass: 'tailwind-modal-panel',
      data: { items: list },
    });

    dialogRef.afterClosed().subscribe((selectedIds: number[]) => {
      if (selectedIds) {
      }
    });
  }

  openModalDespacho() {
    const dialogRef = this.dialog.open(DispatchesModalComponent, {
      panelClass: 'tailwind-modal-panel',
    });

    dialogRef.afterClosed().subscribe((selectedIds: number[]) => {
      if (selectedIds) {
      }
    });
  }

  onSelect(obraId: string) {
    this.idObra = Number(obraId);
    if (isNaN(this.idObra)) return;
    const obra = this.obraServ.list().find((item) => item.id === this.idObra);
    if (!obra) return;

    this.selectedObra = obra;
    this.enterpriseList = obra.empresas;
    this.objServ.loadObjects(this.idObra);
  }

  onSelectEmpresa(empId: string) {
    this.idEmpresa = Number(empId);
  }

  onSelectObjeto(objId: string) {
    this.idObj = Number(objId);
  }

  filtrarDespachos() {
    this.despachosFiltrados = this.originalDespachos.filter((d) => {
      const coincideObra = this.idObra === 0 || d.obra?.id === this.idObra;
      const coincideEmpresa =
        this.idEmpresa === 0 || d.empresa?.id === this.idEmpresa;
      const coincideObjeto = this.idObj === 0 || d.objeto?.id === this.idObj;
      const coincideCodigo = d.codigo
        .toLowerCase()
        .includes(this.codigoFiltro.toLowerCase());

      return (
        coincideObra && coincideEmpresa && coincideObjeto && coincideCodigo
      );
    });
  }

  limpiarFiltros() {
    this.idObra = 0;
    this.idEmpresa = 0;
    this.idObj = 0;
    this.codigoFiltro = '';
    this.despachosFiltrados = [...this.originalDespachos];
  }

  cancelVale(item: DispatcheListItem) {
    this.confServ
      .confirm(
        'Cancelar Vale',
        `¿Está seguro de cancelar el vale "${item.codigo}"?`
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.dispatcheSer.cancelDispatches(item.id);
        }
      });
  }

  controlDespachos(): void {
    this.reportService.generateDispatchReport(this.despachosFiltrados);
  }
}
