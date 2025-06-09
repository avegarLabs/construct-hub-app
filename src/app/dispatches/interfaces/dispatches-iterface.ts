import { EnterpriseListItem } from "../../enterprises/interfaces/enterprise-interface";
import { ObjetctListItem } from "../../works/interfaces/objects-iterface";
import { ResourceListItem } from "../../works/interfaces/resource-iterface";
import { WorksListItem } from "../../works/interfaces/works-interface";


export interface DispatcheListItem {
    id:        number;
    codigo:    string;
    fecha:     string;
    obra:      WorksListItem;
    empresa:   EnterpriseListItem;
    objeto:    ObjetctListItem;
    despachos: DespachoListItem[];
}

export interface DespachoListItem {
    id:                 number;
    recurso:            ResourceListItem;
    cantidadDespachada: number;
}

export interface Dispatches {
    codigo:    string;
    obraId:    number;
    empresaId: number;
    objetoId:  number;
    despachos: ResourceCuant[];
}

export interface ResourceCuant {
    recursoId:          number;
    cantidadDespachada: number;
}

export interface DispatcheReport {
  obra: WorksListItem;
  empresa: EnterpriseListItem;
  objeto: ObjetctListItem;
  despachos: DespachoListItem[];
}
