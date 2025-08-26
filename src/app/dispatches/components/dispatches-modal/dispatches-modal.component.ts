import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorksService } from '../../../works/services/works.service';
import { ObjectService } from '../../../works/objects/services/object.service';
import { DispatchesService } from '../../services/dispatches.service';
import { ResourceService } from '../../../resources/services/resource.service';
import { WorksListItem } from '../../../works/interfaces/works-interface';
import { EnterpriseListItem } from '../../../enterprises/interfaces/enterprise-interface';
import { ResourceListItem } from '../../../works/interfaces/resource-iterface';
import {
  Dispatches,
  ResourceCuant,
} from '../../interfaces/dispatches-iterface';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
@Component({
  selector: 'app-dispatches-modal',
  imports: [MatPaginatorModule],
  templateUrl: './dispatches-modal.component.html',
})
export class DispatchesModalComponent implements OnInit {
  obraServ = inject(WorksService);
  objServ = inject(ObjectService);
  dispServ = inject(DispatchesService);
  resourcesServ = inject(ResourceService);
  selectedObra!: WorksListItem;
  enterpriseList: EnterpriseListItem[] = [];

  idObra: number = 0;
  idEmpresa: number = 0;
  idObj: number = 0;
  selectedRecurso!: ResourceListItem;
  toDesplist: any[] = [];
  disponible: string = '';
  code: string = '';

  pageSize = 4;
  pageIndex = 0;
  pageSizeOptions = [4];

  constructor(
    private dialogRef: MatDialogRef<DispatchesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.code = this.generarCodigoDespacho();
  }

  onSelect(obraId: string) {
    this.idObra = Number(obraId);
    if (isNaN(this.idObra)) return;
    const obra = this.obraServ.list().find((item) => item.id === this.idObra);
    if (!obra) return;

    this.selectedObra = obra;
    this.enterpriseList = obra.empresas;
    this.objServ.loadObjects(this.idObra);
    this.resourcesServ.loadResources(this.idObra);
  }

  onSelectEmpresa(empId: string) {
    this.idEmpresa = Number(empId);
  }

  onSelectObjeto(objId: string) {
    this.idObj = Number(objId);
  }

  onSelectRecursos(idRec: string) {
    const id = Number(idRec);
    this.selectedRecurso = this.resourcesServ
      .list()
      .find((item) => item.id === id);
    this.disponible =
      this.selectedRecurso.disponible.toString() +
      '/' +
      this.selectedRecurso.um;
  }

  populateRecursos(
    valor: string,
    inputElement: HTMLInputElement,
    selectElement: HTMLSelectElement
  ) {
    const cantidad = Number(valor);
    if (cantidad === 0) {
      alert('Debe definir una cantidad');
      return;
    }
    if (this.isPresent(this.selectedRecurso)) {
      alert(
        'El recurso seleccionado ya existe en la lista, revise sus datos!!!'
      );
      return;
    } else {
      if (cantidad <= this.selectedRecurso.disponible) {
        const item = {
          resource: this.selectedRecurso,
          cantidad: cantidad,
        };
        this.toDesplist.push(item);
        inputElement.value = '1';
        selectElement.value = '';
        this.selectedRecurso = null;
      } else {
        alert('Error al agregar el recurso  al despacho, revise sus datos!!!');
        return;
      }
    }
  }

  isPresent(selectedRecurso: ResourceListItem) {
    return this.toDesplist.find(
      (item) => item.resource.id === selectedRecurso.id
    )
      ? true
      : false;
  }

  removeItem(id: number) {
    const index = this.toDesplist.findIndex((rec) => rec.resource.id === id);
    if (index !== -1) {
      this.toDesplist.splice(index, 1);
    }
  }

  confim() {
    const result: ResourceCuant[] = this.toDesplist.map((item) => ({
      recursoId: item.resource.id,
      cantidadDespachada: item.cantidad,
    }));

    const despacho: Dispatches = {
      codigo: this.code,
      obraId: this.idObra,
      objetoId: this.idObj,
      empresaId: this.idEmpresa,
      despachos: result,
    };
    try {
      this.dispServ.newDispatches(despacho);
      this.toDesplist = [];
      this.code = '';
      this.code = this.generarCodigoDespacho();
    } catch (e) {
      console.log(e);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  generarCodigoDespacho(): string {
    this.dispServ.loadDispatches();
    const añoActual = new Date().getFullYear();
    const prefijo = `DSP-${añoActual}-`;
    const codigosDelAño = this.dispServ
      .list()
      .map((item) => item.codigo)
      .filter((codigo) => codigo.startsWith(prefijo));

    const maxConsecutivo = codigosDelAño.reduce((max, codigo) => {
      const partes = codigo.split('-');
      const consecutivo = parseInt(partes[2], 10);
      return !isNaN(consecutivo) && consecutivo > max ? consecutivo : max;
    }, 0);

    const nuevoConsecutivo = (maxConsecutivo + 1).toString().padStart(5, '0');
    return `${prefijo}${nuevoConsecutivo}`;
  }

  get paginatedRecursos() {
    const start = this.pageIndex * this.pageSize;
    return this.toDesplist.slice(start, start + this.pageSize);
  }
  handlePageEvent(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
