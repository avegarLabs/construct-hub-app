import { Component, input, output } from '@angular/core';
import { EnterpriseListItem } from '../../interfaces/enterprise-interface';

@Component({
  selector: 'enterprise-list',
  templateUrl: './list.component.html',
})
export default class ListComponent {
  enterprises = input.required<EnterpriseListItem[]>();
  deleteEnterprise = output<number>();
  editEnterprise = output<number>();

  onDelete(id: number) {
    if (confirm('¿Estás seguro de eliminar esta empresa?')) {
      this.deleteEnterprise.emit(id);
    }
  }

  onEdit(id: number) {
    this.editEnterprise.emit(id);
  }
}
