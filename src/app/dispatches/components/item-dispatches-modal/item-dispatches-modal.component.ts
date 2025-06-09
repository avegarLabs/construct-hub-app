import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DispatchReportService } from '../../services/dispatch-report.service';

@Component({
  selector: 'app-item-dispatches-modal',
  templateUrl: './item-dispatches-modal.component.html',
})
export class ItemDispatchesModalComponent {
   reportServ = inject(DispatchReportService);
  constructor(
     private dialogRef: MatDialogRef<ItemDispatchesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

   cancel() {
    this.dialogRef.close();
  }

  printVale(){
    this.reportServ.generateValeReport(this.data.items)
  }



}
