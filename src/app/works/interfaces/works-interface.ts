import { EnterpriseListItem } from "../../enterprises/interfaces/enterprise-interface";

export interface WorksListItem {
    id:          number;
    codigo:      string;
    descripcion: string;
    empresas:    EnterpriseListItem[];
}

export interface Works {
    codigo:      string;
    descripcion: string;
    empresasId:  number[];
}
