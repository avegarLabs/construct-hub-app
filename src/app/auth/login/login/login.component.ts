import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        MessageModule
    ],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <i class="pi pi-bolt text-primary mb-4" style="font-size: 4rem;"></i>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                                {{ appName }}<span class="text-primary">{{ subName }}</span>
                            </div>
                            <span class="text-muted-color font-medium">{{ label }}</span>
                        </div>

                        <form [formGroup]="form" (ngSubmit)="onSubmit()">
                            <div class="mb-6">
                                <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                                    Usuario
                                </label>
                                <input
                                    pInputText
                                    id="username"
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    class="w-full md:w-[30rem]"
                                    formControlName="username"
                                />
                                <small class="text-red-500" *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
                                    El usuario es requerido
                                </small>
                            </div>

                            <div class="mb-6">
                                <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">
                                    Contrasena
                                </label>
                                <p-password
                                    id="password"
                                    formControlName="password"
                                    placeholder="Contrasena"
                                    [toggleMask]="true"
                                    styleClass="w-full"
                                    [fluid]="true"
                                    [feedback]="false">
                                </p-password>
                                <small class="text-red-500" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
                                    La contrasena es requerida
                                </small>
                            </div>

                            <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage" class="mb-4 w-full"></p-message>

                            <p-button
                                type="submit"
                                label="Ingresar"
                                styleClass="w-full"
                                [loading]="isLoading"
                                [disabled]="form.invalid || isLoading">
                            </p-button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export default class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    appName = environment.appName;
    subName = environment.subName;
    label = environment.label;

    form = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required])
    });

    errorMessage = '';
    isLoading = false;

    onSubmit(): void {
        if (this.form.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        const { username, password } = this.form.value;

        this.authService.login({ username: username!, password: password! }).subscribe({
            next: (res) => {
                this.authService.saveToken(res.token);
                this.router.navigate(['/dashboard']);
            },
            error: () => {
                this.errorMessage = 'Credenciales incorrectas';
                this.isLoading = false;
            }
        });
    }
}
