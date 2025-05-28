import { Component, inject } from '@angular/core';
import { EnterpriseService } from '../../services/enterprise.service';
import ListComponent from '../../components/list/list.component';
import FormComponent from '../../components/form/form.component';
import { Enterprise, EnterpriseListItem } from '../../interfaces/enterprise-interface';

@Component({
  selector: 'app-enterprise-page',
  templateUrl: './enterprise-page.component.html',
  imports: [ListComponent, FormComponent],
})
export default class EnterprisePageComponent {
  enterpriseService = inject(EnterpriseService);

  handleEnterpriseAction(event: {
    type: 'create' | 'update';
    data: EnterpriseListItem;
  }) {
    if (event.type === 'create') {
      const data:Enterprise = {
        codigo: event.data.codigo,
        nombre: event.data.nombre
      }
      this.enterpriseService.newEnterprise(data);
    } else {
      this.enterpriseService.editEnterprise(event.data);
       this.enterpriseService.clearSelection();
    }
  }
}
