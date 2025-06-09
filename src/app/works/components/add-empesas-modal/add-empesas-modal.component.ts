import { Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnterpriseService } from '../../../enterprises/services/enterprise.service';

@Component({
  selector: 'app-add-empesas-modal',
  templateUrl: './add-empesas-modal.component.html',
})
export class AddEmpesasModalComponent {
  empService = inject(EnterpriseService);


  selectedIds = signal<number[]>([]);

  constructor(
    private dialogRef: MatDialogRef<AddEmpesasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  toggleSelection(id: number) {
    const current = this.selectedIds();
    if (current.includes(id)) {
      this.selectedIds.set(current.filter(x => x !== id));
    } else {
      this.selectedIds.set([...current, id]);
    }
  }

  confirm() {
    this.dialogRef.close(this.selectedIds());
  }

  cancel() {
    this.dialogRef.close();
  }

}
