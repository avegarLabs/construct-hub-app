import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  selector: 'app-time-report-modal',
  templateUrl: './time-report-modal.component.html',
})
export class TimeReportModalComponent implements OnInit {
  selectAll: boolean = false;
  selectDateRange: boolean = false;
  startDate: Date;
  endDate: Date;

  constructor(
    private dialogRef: MatDialogRef<TimeReportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.initializeDates();
  }

  cancel() {
    this.dialogRef.close();
  }

  initializeDates() {
    const today = new Date();

    // Primer día del mes
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // Último día del mes
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  onSelectAllChange(event: any) {
    this.selectAll = event.checked;
    if (this.selectAll) {
      this.selectDateRange = false;
    }
  }

  onDateRangeChange(event: any) {
    this.selectDateRange = event.checked;
    if (this.selectDateRange) {
      this.selectAll = false;
    }
  }

 accept() {
    let result: any = {};
    
    if (this.selectAll) {
      result = { selectAll: true };
    } else if (this.selectDateRange) {
      // Convertir a formato PostgreSQL
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
      // Ninguna opción seleccionada
      alert('Por favor, seleccione una opción para generar el reporte');
      return;
    }
    
    this.dialogRef.close(result);
  }

  private convertToPostgresFormat(
    date: Date,
    isEndDate: boolean = false
  ): string {
    if (!date) return '';

    // Ajustar la hora si es la fecha final
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    // Formatear a YYYY-MM-DD HH:MM:SS.mmmmmm
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss.SSSSSS', 'en-US');
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }
}
