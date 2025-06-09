import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports:[ReactiveFormsModule],
   templateUrl: './login.component.html'
})
export default class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router)
  
  constructor() {}

  form = new FormGroup({
     username: new FormControl('', [Validators.required]),
     password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    console.log(this.form.value)
    this.authService.login({ username: this.form.value.username, password: this.form.value.password }).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('Credenciales incorrectas');
      }
    });
  }
}