import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-time-report-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, DatePickerModule],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Opción: Todos los datos -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <p-checkbox
                        [(ngModel)]="selectAll"
                        [binary]="true"
                        inputId="selectAll"
                        (onChange)="onSelectAllChange()">
                    </p-checkbox>
                    <label for="selectAll" class="font-medium cursor-pointer">
                        Obtener todos los datos sin filtro de tiempo
                    </label>
                </div>
                <p class="text-sm text-surface-500 ml-8">
                    Al seleccionar esta opción, se ignorará cualquier intervalo de fechas especificado
                </p>
            </div>

            <!-- Opción: Intervalo de fechas -->
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <p-checkbox
                        [(ngModel)]="selectDateRange"
                        [binary]="true"
                        inputId="selectDateRange"
                        [disabled]="selectAll"
                        (onChange)="onDateRangeChange()">
                    </p-checkbox>
                    <label for="selectDateRange" class="font-medium cursor-pointer">
                        Especificar intervalo de tiempo
                    </label>
                </div>

                @if (selectDateRange && !selectAll) {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-surface-700 dark:text-surface-300">Fecha inicial</label>
                            <p-datepicker
                                [(ngModel)]="startDate"
                                [maxDate]="endDate"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                styleClass="w-full">
                            </p-datepicker>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-medium text-surface-700 dark:text-surface-300">Fecha final</label>
                            <p-datepicker
                                [(ngModel)]="endDate"
                                [minDate]="startDate"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                styleClass="w-full">
                            </p-datepicker>
                        </div>
                    </div>
                }
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancel()">
                </p-button>
                <p-button
                    label="Aceptar"
                    icon="pi pi-check"
                    severity="success"
                    (onClick)="accept()">
                </p-button>
            </div>
        </div>
    `
})
export class TimeReportModalComponent implements OnInit {
    private dialogRef = inject(DynamicDialogRef);

    selectAll: boolean = false;
    selectDateRange: boolean = false;
    startDate!: Date;
    endDate!: Date;

    ngOnInit() {
        this.initializeDates();
    }

    initializeDates() {
        const today = new Date();
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectDateRange = false;
        }
    }

    onDateRangeChange() {
        if (this.selectDateRange) {
            this.selectAll = false;
        }
    }

    cancel() {
        this.dialogRef.close();
    }

    accept() {
        let result: any = {};

        if (this.selectAll) {
            result = { selectAll: true };
        } else if (this.selectDateRange) {
            const startDateTime = this.convertToPostgresFormat(this.startDate);
            const endDateTime = this.convertToPostgresFormat(this.endDate, true);

            result = {
                selectAll: false,
                dateRange: {
                    startDate: startDateTime,
                    endDate: endDateTime
                }
            };
        } else {
            alert('Por favor, seleccione una opción para generar el reporte');
            return;
        }

        this.dialogRef.close(result);
    }

    private convertToPostgresFormat(date: Date, isEndDate: boolean = false): string {
        if (!date) return '';

        const d = new Date(date);
        if (isEndDate) {
            d.setHours(23, 59, 59, 999);
        } else {
            d.setHours(0, 0, 0, 0);
        }

        return formatDate(d, 'yyyy-MM-dd HH:mm:ss.SSSSSS', 'en-US');
    }
}
