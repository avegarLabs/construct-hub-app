import { Injectable } from '@angular/core';
import { ConfirmationService as PrimeConfirmationService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    constructor(private confirmationService: PrimeConfirmationService) {}

    confirm(title: string, message: string): Observable<boolean> {
        const result = new Subject<boolean>();

        this.confirmationService.confirm({
            header: title,
            message: message,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Si',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                result.next(true);
                result.complete();
            },
            reject: () => {
                result.next(false);
                result.complete();
            }
        });

        return result.asObservable();
    }
}
