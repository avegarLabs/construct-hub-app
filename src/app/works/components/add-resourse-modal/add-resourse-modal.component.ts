import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ResourceService } from '../../../resources/services/resource.service';
import { Resource } from '../../interfaces/resource-iterface';

@Component({
  selector: 'app-add-resourse',
  imports: [ReactiveFormsModule],
  templateUrl: './add-resourse-modal.component.html',
})
export class AddResourseComponent implements OnInit {
  resourceServ = inject(ResourceService);

  constructor(
    private dialogRef: MatDialogRef<AddResourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  form = new FormGroup({
    codigo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    um: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required]),
    precio: new FormControl('0'),
  });

  ngOnInit(): void {
    if (this.data.model !== null) {
      this.form.patchValue({
        codigo: this.data.model.codigo,
        descripcion: this.data.model.descripcion,
        um: this.data.model.um,
        cantidad: this.data.model.cantidad,
        precio: this.data.model.precio,
      });
    }
  }

  confirm() {
    const model: Resource = {
      codigo: this.form.value.codigo,
      descripcion: this.form.value.descripcion,
      obraId: this.data.workId,
      um: this.form.value.um,
      cantidad: Number(this.form.value.cantidad),
      precio: Number(this.form.value.precio),
    };

    if (this.data.model === null) {
      this.resourceServ.newResource(model);
      this.form.reset();
    } else {
      this.resourceServ.updateResource(this.data.model.id, model);
      this.form.reset();
      this.cancel();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
