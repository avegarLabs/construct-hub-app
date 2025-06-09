import { Component, inject, OnInit } from '@angular/core';
import { WorksService } from '../../services/works.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { AddWorkComponent } from '../../components/add-work/add-work.component';
import { MatDialog } from '@angular/material/dialog';
import { WorksListItem } from '../../interfaces/works-interface';

@Component({
  selector: 'app-works-page',
  imports: [WordCardComponent],
  templateUrl: './works-page.component.html',
})
export default class WorksPageComponent {
  workService = inject(WorksService);
  private dialog = inject(MatDialog);

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
}
