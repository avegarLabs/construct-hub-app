import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

 private dialog = inject(MatDialog);


confirm(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { title, message },
      panelClass: 'tailwind-modal-panel',
    });
    
    return dialogRef.afterClosed();
  }

}
