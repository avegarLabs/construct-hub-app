import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WorksService } from '../../services/works.service';
import { Works } from '../../interfaces/works-interface';

@Component({
  selector: 'app-add-work',
  imports: [ReactiveFormsModule],
  templateUrl: './add-work.component.html',
})
export class AddWorkComponent implements OnInit {
  obServ = inject(WorksService);

  constructor(
    private dialogRef: MatDialogRef<AddWorkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  form = new FormGroup({
    codigo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (this.data.model !== null) {
      this.form.patchValue({
        codigo: this.data.model.codigo,
        descripcion: this.data.model.descripcion,
      });
    }
  }

  confirm() {
    const model: Works = {
      codigo: this.form.value.codigo,
      descripcion: this.form.value.descripcion,
      empresasId: [],
    };

    if (this.data.model === null) {
      this.obServ.newWorks(model);
      this.form.reset();
    } else {
      this.obServ.editWorks(this.data.model.id, model);
      this.form.reset();
      this.cancel();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
