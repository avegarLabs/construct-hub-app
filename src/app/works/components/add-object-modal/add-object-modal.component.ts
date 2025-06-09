import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ObjectService } from '../../objects/services/object.service';
import { Object } from '../../interfaces/objects-iterface';

@Component({
  selector: 'app-add-object-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './add-object-modal.component.html',
})
export class AddObjectModalComponent {
  objectService = inject(ObjectService);

  constructor(
    private dialogRef: MatDialogRef<AddObjectModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  form = new FormGroup({
    codigo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  confirm() {
    const model: Object = {
      codigo: this.form.value.codigo,
      descripcion: this.form.value.descripcion,
      obraId: this.data.workId,
    };

    this.objectService.newObject(model);
    this.form.reset();
  }

  cancel() {
    this.dialogRef.close();
  }
}
