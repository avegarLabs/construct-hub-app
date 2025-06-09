import { Component, inject, input } from '@angular/core';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faKaaba } from '@fortawesome/free-solid-svg-icons';
import { WorksListItem } from '../../interfaces/works-interface';
import { RouterLink } from '@angular/router';
import { AddWorkComponent } from '../add-work/add-work.component';
import { MatDialog } from '@angular/material/dialog';
import { WorksService } from '../../services/works.service';
import { ConfirmationService } from '../../../share/confirmation.service';

@Component({
  selector: 'app-word-card',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './word-card.component.html',
})
export class WordCardComponent {
  private iconLibrary = inject(FaIconLibrary);
  workservic = inject(WorksService);
  worksItem = input.required<WorksListItem>();
  private dialog = inject(MatDialog);
  confServ = inject(ConfirmationService);
  constructor() {
    this.iconLibrary.addIcons(faKaaba);
  }

  getIconName(icon: string) {
    return icon.replace('fa', '').toLowerCase();
  }

  openModal(item: WorksListItem) {
    const dialogRef = this.dialog.open(AddWorkComponent, {
      width: '700px',
      panelClass: 'tailwind-modal-panel',
      data: { model: item },
    });

    dialogRef.afterClosed().subscribe((selectedIds: string) => {
      if (selectedIds) {
      }
    });
  }

  removeObra(item: WorksListItem) {
      this.confServ
      .confirm(
        'Eliminar Obra',
        `¿Está seguro de eliminar la obra "${item.codigo}"?`
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.workservic.removeWorks(item.id);
        }
      });
  }
}
