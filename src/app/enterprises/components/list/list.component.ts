import { Component, inject, input, output } from '@angular/core';
import { EnterpriseListItem } from '../../interfaces/enterprise-interface';
import { ConfirmationService } from '../../../share/confirmation.service';

@Component({
  selector: 'enterprise-list',
  templateUrl: './list.component.html',
})
export default class ListComponent {
  enterprises = input.required<EnterpriseListItem[]>();
  deleteEnterprise = output<number>();
  editEnterprise = output<number>();
  confServ = inject(ConfirmationService);

  onDelete(emp: EnterpriseListItem) {
    this.confServ
      .confirm(
        'Eliminar Obra',
        `¿Está seguro de eliminar la obra "${emp.codigo}"?`
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteEnterprise.emit(emp.id);
        }
      });
  }

  onEdit(id: number) {
    this.editEnterprise.emit(id);
  }
}
