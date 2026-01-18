export interface ImportResultDTO {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: ImportErrorDTO[];
}

export interface ImportErrorDTO {
    rowNumber: number;
    codigo: string;
    message: string;
}
