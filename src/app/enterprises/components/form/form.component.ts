import { Component, inject, Input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Enterprise, EnterpriseListItem } from '../../interfaces/enterprise-interface';
import { EnterpriseService } from '../../services/enterprise.service';

@Component({
  selector: 'enterprise-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
})
export default class FormComponent {
  newEnterprise = output<Enterprise>();
  enterpriseAction = output<{ type: 'create' | 'update'; data: EnterpriseListItem }>();
  enterpriseService = inject(EnterpriseService);

  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
  });
  

   @Input() set enterpriseToEdit(enterprise: EnterpriseListItem | null) {
    if (enterprise) {
      this.form.patchValue({
        code: enterprise.codigo,
        name: enterprise.nombre
      });
    }
  }

 onSubmit() {
    if (this.form.invalid) return;

    const enterpriseData: EnterpriseListItem = {
      id: this.enterpriseService.selectedEnterpriseId(),
      codigo: this.form.value.code!,
      nombre: this.form.value.name!
    };

    const actionType = this.enterpriseService.selectedEnterpriseId() ? 'update' : 'create';
    this.enterpriseAction.emit({ type: actionType, data: enterpriseData });
    this.form.reset();
  }
}
