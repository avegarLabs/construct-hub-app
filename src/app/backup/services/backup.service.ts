import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BackupHistoryEntry {
    filename: string;
    date: string;
    sizeBytes: number;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
    private http = inject(HttpClient);

    isDownloading = signal(false);
    lastBackup = signal<BackupHistoryEntry | null>(this.loadLastBackup());
    history = signal<BackupHistoryEntry[]>(this.loadHistory());

    downloadBackup(): Observable<{ blob: Blob; filename: string }> {
        this.isDownloading.set(true);
        const filename = `construct-hub_backup_${this.formatTimestamp()}.backup`;

        return new Observable(observer => {
            this.http.get(`${environment.api_route}/backup`, {
                responseType: 'blob'
            }).pipe(
                catchError((error: HttpErrorResponse) => {
                    this.isDownloading.set(false);
                    return throwError(() => error);
                })
            ).subscribe({
                next: async (blob) => {
                    try {
                        await this.saveWithPicker(blob, filename);
                    } catch (pickerError: any) {
                        if (pickerError?.name === 'AbortError') {
                            this.isDownloading.set(false);
                            observer.complete();
                            return;
                        }
                        this.triggerFallbackDownload(blob, filename);
                    }

                    const entry: BackupHistoryEntry = {
                        filename,
                        date: new Date().toISOString(),
                        sizeBytes: blob.size
                    };
                    this.addToHistory(entry);

                    this.isDownloading.set(false);
                    observer.next({ blob, filename });
                    observer.complete();
                },
                error: (err) => {
                    this.isDownloading.set(false);
                    observer.error(err);
                }
            });
        });
    }

    clearHistory(): void {
        localStorage.removeItem('backup_history');
        this.history.set([]);
        this.lastBackup.set(null);
    }

    private async saveWithPicker(blob: Blob, filename: string): Promise<boolean> {
        if (!('showSaveFilePicker' in window)) {
            throw new Error('File System Access API not supported');
        }

        const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
                {
                    description: 'PostgreSQL Backup',
                    accept: { 'application/octet-stream': ['.backup'] }
                }
            ]
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
    }

    private triggerFallbackDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private formatTimestamp(): string {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    }

    private addToHistory(entry: BackupHistoryEntry): void {
        const current = this.history();
        const updated = [entry, ...current].slice(0, 20);
        this.history.set(updated);
        this.lastBackup.set(entry);
        localStorage.setItem('backup_history', JSON.stringify(updated));
    }

    private loadHistory(): BackupHistoryEntry[] {
        try {
            const raw = localStorage.getItem('backup_history');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private loadLastBackup(): BackupHistoryEntry | null {
        const history = this.loadHistory();
        return history.length > 0 ? history[0] : null;
    }
}
