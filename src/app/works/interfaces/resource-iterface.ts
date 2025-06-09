export interface Resource {
    codigo:      string;
    descripcion: string;
    um:          string;
    cantidad:    number;
    precio:      number;
    obraId:      number;
}
export interface ResourceListItem {
    id:          number;
    codigo:      string;
    descripcion: string;
    um:          string;
    cantidad:    number;
    precio:      number;
    disponible:  number;
}
